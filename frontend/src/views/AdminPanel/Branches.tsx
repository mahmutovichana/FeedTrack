import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './branches.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
<<<<<<< HEAD
import { deployURLs } from "./../../../public/constants.js";
import Update from '../../components/update/Update';
=======
>>>>>>> main

interface Branch {
    id: number;
    [key: string]: any;
}

const Branches = () => {
    const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Branch | undefined>(); // Dodali smo stanje za selektovanog korisnika
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [token, setToken] = useState();
  const [user, setUser] = useState(null);


    const [open, setOpen] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]); 
    const [columns, setColumns] = useState<GridColDef[]>([]);

    useEffect(() => {
        fetch(`https://feedtrack-backend.vercel.app/api/branches`)
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

    const deleteBranch = (id: number) => {
<<<<<<< HEAD
        fetch(`${deployURLs.backendURL}/api/branches/${id}`, {
=======
        fetch(`https://feedtrack-backend.vercel.app/api/branches/${id}`, {
>>>>>>> main
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

    let isValidAdmin = false;
  const userDataString = localStorage.getItem('user'); // Koristimo getItem metodu da bismo dobili string iz localStorage-a

  if (!userDataString) {
    console.error("User data not found in localStorage");
  } else {
    const userData = JSON.parse(userDataString); // Parsiramo string u JavaScript objekat
    console.log(userData);

    if (userData && userData.role) { // Provjera da li atribut role postoji
        isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin');
      console.log("IZ USERS: ", userData);
      console.log("DA LI SAM VALIDAN admin: ", isValidAdmin);
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
