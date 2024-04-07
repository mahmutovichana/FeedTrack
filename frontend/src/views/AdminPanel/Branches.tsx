import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/AdminPanel/branches.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import { deployURLs } from "./../../../public/constants.js";
import Update from '../../components/update/Update';

interface Branch {
    id: number;
    [key: string]: any;
}

const Branches = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);

    // Get all branches for the table
    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/branches`)
            .then((response) => response.json())
            .then((data: Branch[]) => {
                if (data.length > 0) {
                    const branch = data[0];
                    const branchKeys = Object.keys(branch);
                    const generatedColumns = branchKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof branch[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setBranches(data);
                }
            })
            .catch((error) => console.error('Error fetching branches:', error));
    }, []);

    // handle deleting a branch
    const deleteBranch = (id: number) => {
        fetch(`${deployURLs.backendURL}/api/branches/${id}`, {
            method: 'DELETE'
        })
            .then((response) => {
                if (response.ok) {
                    const updatedBranches = branches.filter(branch => branch.id !== id);
                    setBranches(updatedBranches);
                } else {
                    console.error('Error deleting branch:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting branch:', error));
    };

    // check if admin is authorized to see and use CRUD 
    let isValidAdmin = false;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) console.error("User data not found in localStorage");
    else {
        const userData = JSON.parse(userDataString);
        if (userData && userData.role) {
            isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin');
            console.log("User: ", userData);
            console.log("Am I a valid admin? ", isValidAdmin);
        } else {
            console.error("Role not found in user data");
        }
    }

    return (
        <div className="branches">
            <div className="info">
                <h1>Branches</h1>
                {isValidAdmin && (
                    <>
                        <button onClick={() => setOpenAdd(true)}>Add</button>
                        <button onClick={() => setOpenUpdate(true)}>Update</button>
                    </>
                )}
            </div>
            <DataTable slug="branches" columns={columns} rows={branches} onDelete={deleteBranch} />
            {openAdd && <Add slug="branch" columns={columns} setOpen={setOpenAdd} />}
            {openUpdate && <Update slug="branch" columns={columns} setOpen={setOpenUpdate} />}
        </div>
    );
};

export default Branches;
