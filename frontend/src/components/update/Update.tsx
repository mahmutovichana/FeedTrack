import { GridColDef } from "@mui/x-data-grid";
import "./update.scss";
import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { deployURLs } from "./../../../public/constants";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleRefreshData: () => void;
};

interface User {
  id: number;
  [key: string]: any;
}

const Update = (props: Props) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  let slugPlural;
    switch (props.slug) {
      case 'user':
        slugPlural = 'users';
        break;
      case 'teller':
        slugPlural = 'tellers';
        break;
      case 'branch':
        slugPlural = 'branches';
        break;
      case 'feedback':
        slugPlural = 'feedbacks';
        break;
      default:
        // Default ako slug ne odgovara nijednoj od opcija
        console.error('Invalid slug:', props.slug);
        return; // Ili postavite default slug
    }

  useEffect(() => {

    // when updating users as branch or teller admin, we need to show only users with 'user' role, provided by userRoles route
    const userDataString = localStorage.getItem('user');
    const userData = JSON.parse(userDataString);
    const isSuperAdmin = userData.role === 'superAdmin';
    if(!isSuperAdmin && props.slug=="user"){
      fetch(`${deployURLs.backendURL}/api/userRoles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.token}`, 
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parsiranje odgovora kao JSON
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => {
        console.log('Data received successfully:', data);
        setUsers(data); 
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }
    else{
      fetch(`${deployURLs.backendURL}/api/${slugPlural}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parsiranje odgovora kao JSON
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => {
        console.log('Data received successfully:', data);
        setUsers(data); 
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }

  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check if admin is superAdmin
    let isSuperAdmin = false;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      console.error("User data not found in localStorage");
    } else {
      const userData = JSON.parse(userDataString);
      if (userData && userData.role) {
        isSuperAdmin = userData.role === 'superAdmin';
      } else {
        console.error("Role not found in user data");
      }
    }

    // Provera validnosti podataka
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{4,15}$/;
    let validRoles;
    if(isSuperAdmin){
      validRoles = ["superAdmin", "tellerAdmin", "branchAdmin", "user"];
    }
    else{
      validRoles = ["user"];
    }
    const currentErrors: { [key: string]: string } = {};

    props.columns.forEach(column => {
      if (column.field !== "id") {
        const value = formData[column.field];
        if (column.field === "email" && !emailRegex.test(value)) {
          currentErrors[column.field] = "Invalid email format";
        } else if (column.field === "mobilenumber" && !phoneRegex.test(value)) {
          currentErrors[column.field] = "Invalid phone number format";
        } else if (column.field === "role" && !validRoles.includes(value)) {
          currentErrors[column.field] = "Invalid role";
        } else if (column.field === "lastname" && value.length < 2) { // Ovde je promenjeno
          currentErrors[column.field] = "Last name must be at least 2 characters long";
        }
      }
    });

    // Ako postoje greške, postavljamo ih i zaustavljamo slanje podataka
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    fetch(`${deployURLs.backendURL}/api/${slugPlural}/${selectedUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (response.ok) {
          console.log('Data sent successfully');
          props.setOpen(false);
          props.toggleRefreshData();
        } else {
          console.log("selected user id: " + selectedUserId);
          console.log("NEvalja, evo data: " + JSON.stringify(formData));
          console.error('Error sending data:', response.statusText);
        }
      })
      .catch(error => console.error('Error sending data:', error));
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUserId(event.target.value);
  };

  return (
    <div className="update">
      <div className="modal">
        <span className="close" onClick={() => props.setOpen(false)}>
          X
        </span>
        <h1>Update {props.slug}</h1>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <Select
              value={selectedUserId || ""}
              onChange={handleUserChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select user
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.name + " " + user.lastname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.field !== "id" && item.field !== "img" && item.field != "verified")
            .map((column) => (
              <div className="item" key={column.field}>
                <label className={errors[column.field] ? 'error-label' : ''}>{column.headerName}</label>
                <input
                  type={column.type}
                  name={column.field}
                  placeholder={column.field}
                  onChange={handleChange2}
                  required
                />
                {errors[column.field] && <span className="error">{errors[column.field]}</span>}
              </div>
            ))}
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Update;

