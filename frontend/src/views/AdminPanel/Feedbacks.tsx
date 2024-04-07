import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './feedbacks.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';

interface Feedback {
    id: number;
    [key: string]: any;
}

const Feedbacks = () => {
    const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Feedback | undefined>(); // Dodali smo stanje za selektovanog korisnika
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [token, setToken] = useState();
  const [user, setUser] = useState(null);


    const [open, setOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]); 
    const [columns, setColumns] = useState<GridColDef[]>([]);

    useEffect(() => {
        fetch(`https://feed-track-backend.vercel.app/api/feedbacks`)
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

    const deleteFeedback = (id: number) => {
        fetch(`https://feed-track-backend.vercel.app/api/feedbacks/${id}`, {
            method: 'DELETE'
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

    
    let isValidAdmin = false;
    const userDataString = localStorage.getItem('user'); // Koristimo getItem metodu da bismo dobili string iz localStorage-a
  
    if (!userDataString) {
      console.error("User data not found in localStorage");
    } else {
      const userData = JSON.parse(userDataString); // Parsiramo string u JavaScript objekat
      console.log(userData);
  
      if (userData && userData.role) { // Provjera da li atribut role postoji
          isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin') || (userData.role === 'tellerAdmin');
        console.log("IZ USERS: ", userData);
        console.log("DA LI SAM validan admin: ", isValidAdmin);
      } else {
        console.error("Role not found in user data");
      }
    }

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
            {openAdd && <Add slug="feedback" columns={columns} setOpen={setOpenAdd} />}
            {openUpdate && <Update slug="feedback" columns={columns} setOpen={setOpenUpdate} />}
        </div>
    );
};

export default Feedbacks;