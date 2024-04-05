import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './users.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';

interface User {
  id: number;
  [key: string]: any;
}

const Users = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // Korišćenje tipa User[]
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(); // Dodali smo stanje za selektovanog korisnika
  const navigate = useNavigate();

  const { state } = useLocation();
  const [name, setName] = useState();
  const [token, setToken] = useState();
  const [user, setUser] = useState(null);


  useEffect(() => {
    if (state && state.user) {
      setToken(state.token)
      setUser(state.user);
    }
  }, [state]);

  useEffect(() => {
    fetch(`https://feedtrack-backend.vercel.app/api/users`)
      .then((response) => response.json())
      .then((data: User[]) => {
        if (data.length > 0) {
          const user = data[0];
          const userKeys = Object.keys(user);
          const generatedColumns = userKeys.map((key) => {
            if (key.toLowerCase() !== 'password') {
              return {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                width: 150,
                type: typeof user[key] === 'boolean' ? 'boolean' : 'string',
              };
            }
            return null;
          }).filter(column => column !== null) as GridColDef[];
          setColumns(generatedColumns);
          setUsers(data);
        }
      })
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const deleteUser = (id: number) => {
    fetch(`https://feedtrack-backend.vercel.app/api/users/${id}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (response.ok) {
          // Ako je korisnik uspešno obrisan, osveži podatke
          const updatedUsers = users.filter(user => user.id !== id);
          setUsers(updatedUsers);
        } else {
          console.error('Error deleting user:', response.statusText);
        }
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  const updateUser = (id: number) => {
    // Pronađi korisnika sa odgovarajućim ID-em
    const userToUpdate = users.find(user => user.id === id);
    // Postavi selektovanog korisnika
    setSelectedUser(userToUpdate);
    // Otvori update formu
    setOpenUpdate(true);
  };

  let isSuperAdmin = false;
  const userDataString = localStorage.user;
  if (!userDataString) {
    console.error("User data not found in localStorage");
  } else {
    const userData = JSON.parse(userDataString);
    isSuperAdmin = userData.role === 'superAdmin';
    console.log("IZ USERS: ", userData);
    console.log("DA LI SAM SUPERADMIN: ", isSuperAdmin);
  }


  return (
    <div className="users">
      <div className="info">
        <h1>Users</h1>
        {isSuperAdmin && (
          <>
            <button onClick={() => setOpenAdd(true)}>Add</button>
            <button onClick={() => setOpenUpdate(true)}>Update</button>
          </>
        )}
      </div>
      <DataTable slug="users" columns={columns} rows={users} onDelete={deleteUser} />
      {openAdd && <Add slug="user" columns={columns} setOpen={setOpenAdd} />}
      {openUpdate && <Update slug="user" columns={columns} setOpen={setOpenUpdate} />}
    </div>
  );
};

export default Users;
