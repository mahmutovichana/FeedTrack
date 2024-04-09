import React, { useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { useNavigate } from "react-router-dom";

export default function Notes() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("file", file);

    if (!file || message.trim() === "") {
      return setUploadMessage("Please provide a message and upload an image.");
    }

    fetch(`${deployURLs.backendURL}/api/welcomeData`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setUploadMessage("Upload successful");
      })
      .catch((err) => {
        console.error("Error uploading file: ", err);
        setUploadMessage("Error uploading file: " + err);
      });
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
      <p className="upload-message">{uploadMessage}</p>
      <br />
      <button type="button" onClick={() => navigate("/userFeedback")}>
        View user feedback page
      </button>
    </div>
  );
}
