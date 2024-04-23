import React, { useEffect, useState } from 'react';
import { deployURLs } from "../../../public/constants.js";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import SelectChangeEvent from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./../../styles/AdminPanel/forms.scss";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Forms = () => {

  interface Campaign {
    id: number;
    [key: string]: any;
  }

  const [questions, setQuestions] = useState([{ text: '' }]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '' }]);
  };

  const handleQuestionChange = (index, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = newText;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    
    const questionTexts = new Set<string>();
    setErrorMessages([]);

    if (!selectedCampaign) {
      console.error('Please select a campaign.');
      return;
    }
  
    for (const question of questions) {
      if (question.text.trim() === '') {
        console.error('All questions must be filled in.');
        return;
      }
    }
  
    // check if all provided questions are unique
    for (const question of questions) {
      if (questionTexts.has(question.text)) {
        console.error(`Duplicate question found: ${question.text}`);
        return;
      }
      questionTexts.add(question.text);
    }
  
    // if the questions are unique, we add them to the server
    for (const question of questions) {
      try {
        // we check if there is a duplicate question in the database
        const response = await fetch(`${deployURLs.backendURL}/api/questions/name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: question.text })
        });
  
        if (!response.ok) {
          throw new Error(`Error checking if the question exists: ${response.status}`);
        }
  
        const existingQuestion = await response.json();
  
        if (existingQuestion.question) {
          toast.error(`The question "${question.text}" already exists in the database.`);
          continue; // we continue if the question already exists
        }
  
        // if the question does not exist in the database, then we add it
        const questionResponse = await fetch(`${deployURLs.backendURL}/api/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: question.text
          })
        });
  
        if (!questionResponse.ok) {
          throw new Error(`Error adding question "${question.text}" to the database: ${questionResponse.status}`);
        }
  
        const questionData = await questionResponse.json();
  
        // after adding the question, we add the relation between the question and its campaign
        const campaignQuestionResponse = await fetch(`${deployURLs.backendURL}/api/campaignQuestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campaignID: selectedCampaign,
            questionID: questionData.id
          })
        });
  
        if (!campaignQuestionResponse.ok) {
          throw new Error(`Error adding question "${question.text}" to the campaign: ${campaignQuestionResponse.status}`);
        }

        toast("Succesfully added new questions!");
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {

    fetch(`${deployURLs.backendURL}/api/campaigns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => {
        console.log('Data received successfully:', data);
        setCampaigns(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  }, []);

  const handleUserChange = (event: SelectChangeEvent<Campaign>) => {
    const selectedCampaignValue = event.target.value as Campaign;
    setSelectedCampaign(selectedCampaignValue);
    console.log("ovo je selectedCampaign: " + selectedCampaignValue);
  };
  

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  return (
    <div className='formsContainer'>
      <h1>Create New Question Set</h1>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <Select
            value={selectedCampaign || ""}
            onChange={handleUserChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Select campaign</MenuItem>
            {campaigns.map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {questions.map((question, index) => (
        <div key={index} className="questionInput">
          <input
            type="text"
            placeholder={`Enter question ${index + 1}`}
            value={question.text}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
          <img
            src="/delete.svg"
            alt="Delete"
            onClick={() => handleRemoveQuestion(index)}
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          />
        </div>
      ))}
      <button onClick={handleAddQuestion}>Add Question</button>
      <button onClick={handleSubmit}>Submit</button>
      {!selectedCampaign && (
        <p style={{ color: 'red' }}>Please select a campaign.</p>
      )}
      {questions.some(question => question.text.trim() === '') && (
        <p style={{ color: 'red' }}>All questions must be filled in!</p>
      )}
      {errorMessages.map((errorMessage, index) => (
        <p key={index} style={{ color: 'red' }}>{errorMessage}</p>
      ))}
      <ToastContainer />
    </div>
  );
  
};

export default Forms;