import { GridColDef } from "@mui/x-data-grid";
import "./update.scss";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";

import { deployURLs } from "./../../../public/constants";
import internal from "stream";
import branches from "../../views/AdminPanel/Branches";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleRefreshData: () => void;
};

const roleOptions = [
  { value: "user", label: "User" },
  { value: "superAdmin", label: "Super Admin" },
  { value: "tellerAdmin", label: "Teller Admin" },
  { value: "branchAdmin", label: "Branch Admin" },
];

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

type FormData = {
  [key: string]: string;
  startDate?: string;
  endDate?: string;
  date?: string;
};

const Update = (props: Props) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<{ id: number; name: string; lastname: string, role: string }[]>([]);

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

  const [campaigns, setCampaigns] = useState<{ id: number; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: number; location: string }[]>([]);

  useEffect(() => {
    // Dohvaćanje kampanja sa servera
    fetch(`${deployURLs.backendURL}/api/campaigns/`, {
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
        console.log("Campaigns received successfully:", data);
        setCampaigns(data);
      })
      .catch((error) => {
        console.error("Error fetching campaigns:", error);
      });
    // Dohvacanje brancheva sa servera
    fetch(`${deployURLs.backendURL}/api/branches/`, {
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
          console.log("Campaigns received successfully:", data);
          setBranches(data);
        })
        .catch((error) => {
          console.error("Error fetching campaigns:", error);
        });
// Fetch managers from the backend
fetch(`${deployURLs.backendURL}/api/users/`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (response.ok) {
      return response.json(); // Parse the response as JSON
    } else {
      throw new Error("Network response was not ok");
    }
  })
  .then((data) => {
    console.log("Managers received successfully:", data);
    setManagers(data);
  })
  .catch((error) => {
    console.error("Error fetching managers:", error);
  });
}, []);

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
        const updatedFormData: FormData = {};
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

        // Prilagodite format datuma u formData, ako je potrebno
        if (updatedFormData.startDate) {
          updatedFormData.startDate = new Date(updatedFormData.startDate).toISOString().split('T')[0];
        }
        if (updatedFormData.endDate) {
          updatedFormData.endDate = new Date(updatedFormData.endDate).toISOString().split('T')[0];
        }
        if (updatedFormData.date) {
          updatedFormData.date = new Date(updatedFormData.date).toISOString().split('T')[0];
        }

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

    if(props.slug!=("question" || "teller")){
    
      // Postavljanje campaignID u formData
      setFormData({
        ...formData,
        campaignID: formData.campaign,
      });
    }

    console.log("Form Data after setting campaign ID:", formData);
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

  // Filter managers based on their role
  // Filter managers based on the current slug
  const filteredManagers = managers.filter(manager => {
    if (props.slug === 'branch') {
      return manager.role === 'branchAdmin';
    } else if (props.slug === 'teller') {
      return manager.role === 'tellerAdmin';
    }
    // Dodajte druge slučajeve slug-a po potrebi
    return true; // Ako slug nije 'branch' ili 'teller', prikaži sve managere
  });


  const handleManagerChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      managerID: e.target.value as string,
    });
  };

  const handleBranchChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      branchID: e.target.value as string,
    });
  };

  const handleCampaignChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      campaignID: e.target.value as string,
    });
  };

  // Define a custom type for the event
  type UserSelectChangeEvent = SelectChangeEvent<string>;

  const handleUserChange = (event: UserSelectChangeEvent) => {
    const value = event.target.value;
    setSelectedId(value === "" ? null : value);
  };

  return (
    <div className="update">
      <div className="modal">
        <span className="close" onClick={() => props.setOpen(false)}>X</span>
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
            .filter((item) => item.field !== "id" && item.field !== "rating" && item.field !== "img" && item.field !== "verified")
            .map((column) => (
              <div className="item" key={column.field}>
                <label className={errors[column.field] ? "error-label" : ""}>
                  {column.headerName}
                </label>
                {/* Provjera da li je polje "campaign" */}
                {column.field === "campaign" ? (
                  <div>
                    
                    <FormControl fullWidth>
                      <Select
                        value={formData[column.field] || ""}
                        onChange={handleCampaignChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select {column.headerName}
                        </MenuItem>
                        {campaigns.map((campaign) => (
                          <MenuItem key={campaign.id} value={campaign.id.toString()}>
                            {campaign.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                ): column.field === "manager" ? (
                  <Select
                    value={formData.managerID || ""}
                    onChange={handleManagerChange}
                    //placeholder="Select Manager"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select {column.headerName}
                    </MenuItem>
                    {filteredManagers.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id.toString()}>
                        {manager.name} {manager.lastname}
                      </MenuItem>
                    ))}
                  </Select>
                ) : column.field === "branch" ? (
                        <Select
                            value={formData.branchID || ""}
                            onChange={handleBranchChange}
                            //placeholder="Select Branch"
                            displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select {column.headerName}
                          </MenuItem>
                          {branches.map((branch) => (
                              <MenuItem key={branch.id} value={branch.id.toString()}>
                                {branch.location}
                              </MenuItem>
                          ))}
                        </Select>
                  ) : (
                  // Ako nije polje "campaign", prikaži običan input
                  <div>
          
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

