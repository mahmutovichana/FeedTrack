import { GridColDef } from "@mui/x-data-grid";
import "./add.scss";
import React, { useEffect, useState } from "react";
import { deployURLs } from "./../../../public/constants";
import { Select, MenuItem, TextField } from "@mui/material";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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

const Add = (props: Props) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [managers, setManagers] = useState<{ id: number; name: string; lastname: string, role: string }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: number; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: number; location: string }[]>([]);
  const [questions, setQuestions] = useState<{ id: number; name: string }[]>([]);
  const [tellers, setTellers] = useState<{ id: number; }[]>([]);
  const [dateValue, setDateValue] = React.useState<Dayjs | null>(dayjs());

  useEffect(() => {

    // Fetch branches from the backend
    fetch(`${deployURLs.backendURL}/api/branches/`, {
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
        console.log("Branches received successfully:", data);
        setBranches(data);
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
      });

    // Fetch campaigns from the backend
    fetch(`${deployURLs.backendURL}/api/campaigns/`, {
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
        console.log("Campaigns received successfully:", data);
        setCampaigns(data);
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
    // Fetch tellers from the backend
    fetch(`${deployURLs.backendURL}/api/tellers/`, {
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
        console.log("Tellers received successfully:", data);
        setTellers(data);
      })
      .catch((error) => {
        console.error("Error fetching tellers:", error);
      });
    // Fetch questions from the backend
    fetch(`${deployURLs.backendURL}/api/questions/`, {
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
        console.log("Questions received successfully:", data);
        setQuestions(data);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  const handleDateChange = (newValue: Dayjs | null) => {
    console.log("date value: "+newValue);
    setDateValue(newValue);
    setFormData({ 
      ...formData, 
      date: newValue ? newValue.toISOString() : "" 
    });
  };

  const handleCampaignChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      campaignID: e.target.value as string,
    });
  };

  const handleQuestionChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      questionID: e.target.value as string,
    });
  };

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

  const handleTellerChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      tellerPositionID: e.target.value as string,
    });
  };

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

    // Provjera validnosti podataka
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
          currentErrors[column.field] =
            "Last name must be at least 2 characters long";
        }
      }
    });

    // Ako postoje greške, postavljamo ih i zaustavljamo slanje podataka
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

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

    console.log(JSON.stringify(formData));

    fetch(`${deployURLs.backendURL}/api/${slugPlural}`, {
      method: "POST",
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

  // pick up all form data when submitted and save it to formData object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // handles combobox selected value from the list of roles
  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      role: e.target.value as string,
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="add">
        <div className="modal">
          <span className="close" onClick={() => props.setOpen(false)}>
            X
          </span>
          <h1>Add new {props.slug}</h1>
          <form onSubmit={handleSubmit}>
            {props.columns
              .filter(
                (item) =>
                  item.field !== "id" &&
                  item.field !== "rating" &&
                  item.field !== "img" &&
                  item.field != "verified"
              )
              .map((column) => (
                <div className="item" key={column.field}>
                  <label className={errors[column.field] ? "error-label" : ""}>
                    {column.headerName}
                  </label>
                  {/* Prikaži ComboBox ako je polje role */}
                  {column.field === "role" ? (
                    <Select
                      value={formData.role || ""}
                      onChange={handleRoleChange}
                      //placeholder="Select Role"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select {column.headerName}
                      </MenuItem>
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : column.field === "campaign" ? (
                    <Select
                      value={formData.campaignID || ""}
                      onChange={handleCampaignChange}
                      //placeholder="Select Campaign"
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
                  ) : column.field === "question" ? (
                    <Select
                      value={formData.questionID || ""}
                      onChange={handleQuestionChange}
                      //placeholder="Select Question"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select {column.headerName}
                      </MenuItem>
                      {questions.map((question) => (
                        <MenuItem key={question.id} value={question.id.toString()}>
                          {question.name}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : column.field === "manager" ? (
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
                  ) : column.field === "teller ID" ? (
                    <Select
                      value={formData.tellerPositionID || ""}
                      onChange={handleTellerChange}
                      //placeholder="Select Teller"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select {column.headerName}
                      </MenuItem>
                      {tellers.map((teller) => (
                        <MenuItem key={teller.id} value={teller.id.toString()}>
                          {teller.id}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : column.field === "date" && props.slug === "feedback" ? (
                    <DateTimePicker
                      label={column.field}
                      value={dateValue}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  ) : (
                    <input
                      type={
                        column.field.toLowerCase().includes("date")
                          ? "date"
                          : column.type
                      }
                      name={column.field}
                      placeholder={column.field}
                      onChange={handleChange}
                      required
                    />
                  )}
                  {errors[column.field] && (
                    <span className="error">{errors[column.field]}</span>
                  )}
                </div>
              ))}
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default Add;
