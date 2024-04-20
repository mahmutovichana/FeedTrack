import { GridColDef } from "@mui/x-data-grid";
import "./add.scss";
import React, { useState } from "react";
import { deployURLs } from "./../../../public/constants";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleRefreshData: () => void;
};

const Add = (props: Props) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
          // Ovde je promenjeno
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

    console.log(JSON.stringify(formData));

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
      default:
        // Default ako slug ne odgovara nijednoj od opcija
        console.error("Invalid slug:", props.slug);
        return; // Ili postavite default slug
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
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
                item.field !== "img" &&
                item.field != "verified"
            )
            .map((column) => (
              <div className="item" key={column.field}>
                <label className={errors[column.field] ? "error-label" : ""}>
                  {column.headerName}
                </label>
                <input
                  type={column.field === "date" ? "date" : column.type}
                  name={column.field}
                  placeholder={column.field}
                  onChange={handleChange}
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

export default Add;
