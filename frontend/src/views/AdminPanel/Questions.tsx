import React, { useState, useEffect } from 'react';
import './../../styles/AdminPanel/questions.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';
import { deployURLs } from "./../../../public/constants";
import Select from "@mui/material/Select";
import SelectChangeEvent from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Question {
    id: number;
    [key: string]: any;
}

interface Campaign {
    id: number;
    name: string;
    [key: string]: any;
}

const Questions = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [refreshData, setRefreshData] = useState(false);
    let [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    // get all questions for the table
    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/questions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data: Question[]) => {
                if (data.length > 0) {
                    const question = data[0];
                    const questionKeys = Object.keys(question);
                    const generatedColumns = questionKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof question[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setQuestions(data);
                }
            })
            .catch((error) => console.error('Error fetching questions:', error));
    }, []);

    // display all the campaign names
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
                setCampaigns(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // handles the change from the combo box of the list of campaign names
    const handleCampaignChange = (event: SelectChangeEvent<number>) => {
        const selectedCampaignValue = event.target.value;
        setSelectedCampaign(campaigns.find(campaign => campaign.id === selectedCampaignValue));
    };

    // display all the questions for the selected campaign
    useEffect(() => {
        if (selectedCampaign) {
            fetch(`${deployURLs.backendURL}/api/campaigns/${selectedCampaign.id}/campaignQuestions`, {
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
                    if (data.length === 0) {
                        setQuestions([]);
                        toast.info('No questions found for selected campaign.');
                    } else {
                        setQuestions(data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching campaign questions:', error);
                });
        }
    }, [selectedCampaign]);


    // handle deleting a question
    const deleteQuestion = (id: number) => {
        fetch(`${deployURLs.backendURL}/api/questions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`,
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    const updatedQuestions = questions.filter(question => question.id !== id);
                    setQuestions(updatedQuestions);
                } else {
                    console.error('Error deleting question:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting question:', error));
    };

    // check if admin is authorized to see and use CRUD 
    let isValidAdmin = false;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) console.error("User data not found in localStorage");
    else {
        const userData = JSON.parse(userDataString);
        if (userData && userData.role) {
            isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin') || (userData.role === 'tellerAdmin');
            console.log("User: ", userData);
            console.log("Am I a valid admin? ", isValidAdmin);
        } else {
            console.error("Role not found in user data");
        }
    }

    const toggleRefreshData = () => {
        setRefreshData(prevState => !prevState);
    };

    return (
        <div className="questions">
            <div className="info">
                <h1>Questions</h1>
                {isValidAdmin && (
                    <>
                        <button onClick={() => setOpenAdd(true)}>Add</button>
                        <button onClick={() => setOpenUpdate(true)}>Update</button>
                    </>
                )}
            </div>
            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <Select
                        value={selectedCampaign ? selectedCampaign.id : ""}
                        onChange={handleCampaignChange}
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
            <DataTable slug="questions" columns={columns} rows={questions} onDelete={deleteQuestion} />
            {openAdd && <Add slug="question" columns={columns} setOpen={setOpenAdd} toggleRefreshData={toggleRefreshData} />}
            {openUpdate && <Update slug="question" columns={columns} setOpen={setOpenUpdate} toggleRefreshData={toggleRefreshData} />}
            <ToastContainer/>
        </div>
    );
};

export default Questions;