import React, { useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";

const Notes = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("file", file);

      // Form data
      for (const pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }

      const response = await fetch(`${deployURLs.backendURL}/api/welcomeData`, {
        method: "POST",
        mode: "no-cors",
        headers: {
          authorization: `Bearer ${localStorage.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error("Error uploading file: ", err);
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
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
      <br />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Notes;
