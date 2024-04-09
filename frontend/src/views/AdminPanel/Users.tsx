import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../../styles/AdminPanel/users.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';
import { deployURLs } from '../../../public/constants';

interface User {
  id: number;
  [key: string]: any;
}

const Users = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // Korišćenje tipa User[]
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const { state } = useLocation();
  const [token, setToken] = useState();
  const [user, setUser] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    if (state && state.user) {
      setToken(state.token)
      setUser(state.user);
    }
  }, [state]);

  // check if admin is superAdmin
  let isSuperAdmin = false;
  const userDataString = localStorage.getItem('user');
  if (!userDataString) {
    console.error("User data not found in localStorage");
  } else {
    const userData = JSON.parse(userDataString);
    if (userData && userData.role) {
      isSuperAdmin = userData.role === 'superAdmin';
      console.log("User: ", userData);
      console.log("Am I a super admin? ", isSuperAdmin);
    } else {
      console.error("Role not found in user data");
    }
  }

  // if superAdmin fetch all roles to crud, otherwise (if teller or branch admin) fetch only 'user' roles
  useEffect(() => {
    if (isSuperAdmin) {
      fetch(`${deployURLs.backendURL}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.token}`, 
          'Content-Type': 'application/json',
        }
      })
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
    } else {
      // Fetch from another route (only 'user' roles)
      fetch(`${deployURLs.backendURL}/api/userRoles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.token}`, 
          'Content-Type': 'application/json',
        }
      })
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
    }
  }, [isSuperAdmin, refreshData]);

  const toggleRefreshData = () => {
    setRefreshData(prevState => !prevState);
  };

  const deleteUser = (id: number) => {
    fetch(`${deployURLs.backendURL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.token}`, 
        'Content-Type': 'application/json',
    }
    })
      .then((response) => {
        if (response.ok) {
          // if user is deleted succesfully, then refresh the table
          const updatedUsers = users.filter(user => user.id !== id);
          setUsers(updatedUsers);
        } else {
          console.error('Error deleting user:', response.statusText);
        }
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  useEffect(() => {
    if (openAdd || openUpdate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openAdd, openUpdate]);

  return (
    <div className="users">
      <div className="info">
        <h1>Users</h1>
        {(
          <>
            <button onClick={() => setOpenAdd(true)}>Add</button>
            <button onClick={() => setOpenUpdate(true)}>Update</button>
          </>
        )}
      </div>
      <DataTable slug="users" columns={columns} rows={users} onDelete={deleteUser} />
      {openAdd && <Add slug="user" columns={columns} setOpen={setOpenAdd} toggleRefreshData={toggleRefreshData}/>}
      {openUpdate && <Update slug="user" columns={columns} setOpen={setOpenUpdate} toggleRefreshData={toggleRefreshData}/>}
    </div>
  );
};

export default Users;
