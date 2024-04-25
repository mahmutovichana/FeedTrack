import { GridColDef } from "@mui/x-data-grid";
import "./update.scss";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import SelectChangeEvent from "@mui/material/Select";

import { deployURLs } from "./../../../public/constants";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleRefreshData: () => void;
};

const getColumnValue = (user: User, slug: string) => {
  switch (slug) {
    case "user":
      return `${user.name} ${user.lastname}`;
    case "branch":
      return user.location;
    case "teller":
      return user.id.toString();
    case "feedback":
      return user.id.toString();
    case "campaign":
      return user.name;
    case "question":
      return user.name;
    default:
      return "";
  }
};

interface User {
  id: number;
  [key: string]: any;
}

const Update = (props: Props) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  let slugPlural;
  switch (props.slug) {
    case "user":
      slugPlural = "users";
      break;
    case "teller":
      slugPlural = "tellers";
      break;
    case "branch":
      slugPlural = "branches";
      break;
    case "feedback":
      slugPlural = "feedbacks";
      break;
    case "campaign":
      slugPlural = "campaigns";
      break;
    case "question":
      slugPlural = "questions";
      break;
    default:
      console.error("Invalid slug:", props.slug);
      return; 
  }

  useEffect(() => {
    // when updating users as branch or teller admin, we need to show only users with 'user' role, provided by userRoles route
    const userDataString = localStorage.getItem("user");
    const userData = JSON.parse(userDataString);
    const isSuperAdmin = userData.role === "superAdmin";
    if (!isSuperAdmin && props.slug == "user") {
      fetch(`${deployURLs.backendURL}/api/userRoles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parsiranje odgovora kao JSON
          } else {
            throw new Error("Network response was not ok");
          }
        })
        .then((data) => {
          console.log("Data received successfully:", data);
          setUsers(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else {
      fetch(`${deployURLs.backendURL}/api/${slugPlural}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parsiranje odgovora kao JSON
          } else {
            throw new Error("Network response was not ok");
          }
        })
        .then((data) => {
          console.log("Data received successfully:", data);
          setUsers(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      // Pronalaženje odabranog korisnika
      const selectedUser = users.find((user) => user.id.toString() === selectedId);
      if (selectedUser) {
        // Kreiranje novog objekta koji će sadržavati ažurirane vrijednosti formData
        const updatedFormData = {};
        // Iteriranje kroz kolone i postavljanje vrijednosti formData na osnovu odabranog korisnika
        props.columns.forEach((column) => {
          // Provjera da li postoji vrijednost u odabranom korisniku za trenutnu kolonu
          if (selectedUser[column.field] !== undefined) {
            // Postavljanje vrijednosti formData
            updatedFormData[column.field] = selectedUser[column.field];
          }
        });
        // Provjeri u konzoli da li su vrijednosti tačno postavljene
        console.log("Updated Form Data:", updatedFormData);
        // Postavljanje ažuriranog stanja formData
        setFormData(updatedFormData);
      }
    }
  }, [selectedId, users]);
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check if admin is superAdmin
    let isSuperAdmin = false;
    const userDataString = localStorage.getItem("user");
    if (!userDataString) {
      console.error("User data not found in localStorage");
    } else {
      const userData = JSON.parse(userDataString);
      if (userData && userData.role) {
        isSuperAdmin = userData.role === "superAdmin";
      } else {
        console.error("Role not found in user data");
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{4,15}$/;
    let validRoles;
    if (isSuperAdmin) {
      validRoles = ["superAdmin", "tellerAdmin", "branchAdmin", "user"];
    } else {
      validRoles = ["user"];
    }
    const currentErrors: { [key: string]: string } = {};

    props.columns.forEach((column) => {
      if (column.field !== "id") {
        const value = formData[column.field];
        if (column.field === "email" && !emailRegex.test(value)) {
          currentErrors[column.field] = "Invalid email format";
        } else if (column.field === "mobilenumber" && !phoneRegex.test(value)) {
          currentErrors[column.field] = "Invalid phone number format";
        } else if (column.field === "role" && !validRoles.includes(value)) {
          currentErrors[column.field] = "Invalid role";
        } else if (column.field === "lastname" && value.length < 2) {
          // Ovde je promenjeno
          currentErrors[column.field] =
            "Last name must be at least 2 characters long";
        }
      }
    });

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    fetch(`${deployURLs.backendURL}/api/${slugPlural}/${selectedId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Data sent successfully");
          props.setOpen(false);
          props.toggleRefreshData();
        } else {
          console.error("Error sending data:", response.statusText);
        }
      })
      .catch((error) => console.error("Error sending data:", error));
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedId(event.target.value);
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
              value={selectedId || ""}
              onChange={handleUserChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select {props.slug}
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {getColumnValue(user, props.slug)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.field !== "id" && item.field!=="rating" &&  item.field !== "img" && item.field != "verified")
            .map((column) => (
              <div className="item" key={column.field}>
                <label className={errors[column.field] ? "error-label" : ""}>
                  {column.headerName}
                </label>
                <input
                  type={
                    column.field.toLowerCase().includes("date")
                      ? "date"
                      : column.type
                  }
                  name={column.field}
                  value={formData[column.field] || ''}
                  placeholder={column.field}
                  onChange={handleChange2}
                  required
                />
                {errors[column.field] && (
                  <span className="error">{errors[column.field]}</span>
                )}
              </div>
            ))}
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Update;
