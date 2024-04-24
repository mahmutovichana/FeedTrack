import React, { useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

const Notes = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 200,
      });
      const base64 = await convertToBase64(compressedFile);

      const response = await fetch(`${deployURLs.backendURL}/api/welcomeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64, message }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) toast.success("Successfully changed welcome notes!");
      else toast.error("Error: " + data.message);
    } catch (err) {
      console.error(err.message);
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
          accept=".jpeg, .png, .jpg"
          onChange={handleFileChange}
        />
      </label>
      <br />
      <button onClick={handleUpload}>Upload</button>
      <ToastContainer />
    </div>
  );
};

export default Notes;
