import React, { useEffect, useState } from 'react';
import { deployURLs } from "../../../public/constants.js";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


const Forms = () => {


  interface Campaign {
    id: number;
    [key: string]: any;
  }


  const [questions, setQuestions] = useState([{ text: '' }]);


  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '' }]);
  };


  const handleQuestionChange = (index, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = newText;
    setQuestions(updatedQuestions);
  };


  const handleSubmit = () => {
    // Kreiramo set koji će sadržavati tekstove svih pitanja
    const questionTexts = new Set<string>();
 
    // Proveravamo da li su svi tekstovi pitanja unikatni
    for (const question of questions) {
      if (questionTexts.has(question.text)) {
        console.error(`Duplicate question found: ${question.text}`);
        return; // Prekidamo funkciju ako je pronađeno duplicirano pitanje
      }
      questionTexts.add(question.text); // Dodajemo tekst pitanja u set
    }
 
    // Ako su sva pitanja unikatna, šaljemo ih na server
    questions.forEach((question, index) => {
      fetch(`${deployURLs.backendURL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: question.text
        })
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error adding question ${index + 1} to the question table`);
        }
      })
      .then(questionData => {
        fetch(`${deployURLs.backendURL}/api/campaignQuestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campaignID: selectedCampaign?.id, // Provjeravamo da li je selectedCampaign definisan prije upotrebe
            questionID: questionData.id
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error adding question ${index + 1} to the campaignQuestion table`);
          }
        })
        .catch(error => {
          console.error(error);
        });
      })
      .catch(error => {
        console.error(error);
      });
     
  });
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
    setSelectedCampaign(event.target.value as Campaign);
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
              <MenuItem value="" disabled>
                Select campaign
              </MenuItem>
              {campaigns.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.name.toString()}>
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
        </div>
      ))}
      <button onClick={handleAddQuestion}>Add Question</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};


export default Forms;
