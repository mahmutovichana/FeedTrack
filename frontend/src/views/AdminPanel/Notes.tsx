import React, { useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notes = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("file", file);

      const response = await fetch(`${deployURLs.backendURL}/api/welcomeData`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);
      if(response.ok) toast.success("Successfully changed welcome notes!");
      else toast.error("Error: "+data.message);
    } catch (err) {
    }
  };

  return (
    <div className="notes">
      <h1>Welcome screen notes</h1>
      <label>
        Welcome message:{" "}
        <input
          type="text"
          id="message"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <br />
      <label>
        Upload image:{" "}
        <input type="file" id="file" onChange={handleFileChange} />
      </label>
      <br />
      <button onClick={handleUpload}>Upload</button>
      <ToastContainer/>
    </div>
  );
};

export default Notes;