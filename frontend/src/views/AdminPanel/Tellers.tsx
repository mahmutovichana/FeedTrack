import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/AdminPanel/tellers.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import { deployURLs } from "./../../../public/constants.js";
import Update from '../../components/update/Update';

interface Teller {
    id: number;
    [key: string]: any;
}

const Tellers = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [tellers, setTellers] = useState<Teller[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);

    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/tellers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`, 
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data: Teller[]) => {
                if (data.length > 0) {
                    const teller = data[0];
                    const tellerKeys = Object.keys(teller);
                    const generatedColumns = tellerKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof teller[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setTellers(data);
                }
            })
            .catch((error) => console.error('Error fetching tellers:', error));
    }, []);

    const deleteTeller = (id: number) => {
        fetch(`${deployURLs.backendURL}/api/tellers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`, 
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    const updatedTellers = tellers.filter(teller => teller.id !== id);
                    setTellers(updatedTellers);
                } else {
                    console.error('Error deleting teller:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting teller:', error));
    };

    // check if admin is authorized to see and use CRUD 
    let isValidAdmin = false;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
        console.error("User data not found in localStorage");
    } else {
        const userData = JSON.parse(userDataString);
        if (userData && userData.role) {
            isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin') || (userData.role === 'tellerAdmin');
            console.log("User: ", userData);
            console.log("Am I a valid admin? ", isValidAdmin);
        } else {
            console.error("Role not found in user data");
        }
    }

    return (
        <div className="tellers">
            <div className="info">
                <h1>Tellers</h1>
                {isValidAdmin && (
                    <>
                        <button onClick={() => setOpenAdd(true)}>Add</button>
                        <button onClick={() => setOpenUpdate(true)}>Update</button>
                    </>
                )}
            </div>
            <DataTable slug="tellers" columns={columns} rows={tellers} onDelete={deleteTeller} />
            {openAdd && <Add slug="teller" columns={columns} setOpen={setOpenAdd} />}
            {openUpdate && <Update slug="teller" columns={columns} setOpen={setOpenUpdate} />}
        </div>
    );
};

export default Tellers;
