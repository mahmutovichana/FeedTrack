import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/AdminPanel/feedbacks.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';
import { deployURLs } from "./../../../public/constants";

interface Feedback {
    id: number;
    [key: string]: any;
}

const Feedbacks = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [refreshData, setRefreshData] = useState(false);

    // get all feedbacks for the table
    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/feedback/view`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data: Feedback[]) => {
                if (data.length > 0) {
                    const feedback = data[0];
                    const feedbackKeys = Object.keys(feedback);
                    const generatedColumns = feedbackKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof feedback[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setFeedbacks(data);
                }
            })
            .catch((error) => console.error('Error fetching feedbacks:', error));
    }, []);

    // handle deleting a feedback
    const deleteFeedback = (id: number) => {
        fetch(`${deployURLs.backendURL}/api/feedbacks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`,
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    const updatedFeedbacks = feedbacks.filter(feedback => feedback.id !== id);
                    setFeedbacks(updatedFeedbacks);
                } else {
                    console.error('Error deleting feedback:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting feedback:', error));
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
        <div className="feedbacks">
            <div className="info">
                <h1>Feedbacks</h1>
                {isValidAdmin && (
                    <>
                        <button onClick={() => setOpenAdd(true)}>Add</button>
                        <button onClick={() => setOpenUpdate(true)}>Update</button>
                    </>
                )}
            </div>
            <DataTable slug="feedbacks" columns={columns} rows={feedbacks} onDelete={deleteFeedback} />
            {openAdd && <Add slug="feedback" columns={columns} setOpen={setOpenAdd} toggleRefreshData={toggleRefreshData} />}
            {openUpdate && <Update slug="feedback" columns={columns} setOpen={setOpenUpdate} toggleRefreshData={toggleRefreshData} />}
        </div>
    );
};

export default Feedbacks;