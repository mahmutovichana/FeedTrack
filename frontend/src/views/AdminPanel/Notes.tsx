import React, { useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

const Notes = () => {
  const [file, setFile] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");

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

  const handleWelcomeDataUpload = async () => {
    let compressedFile;

    try {
      compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 200,
      });
    } catch (err) {
      toast.error("Error: File is required");
      return;
    }

    try {
      const base64 = await convertToBase64(compressedFile);

      const response = await fetch(`${deployURLs.backendURL}/api/welcomeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64, message: welcomeMessage }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        toast.success("Successfully changed welcome notes!");
        setFile(null);
        setWelcomeMessage("");
      } else toast.error("Error: " + data.message);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleThankYouDataUpload = async () => {
    try {
      const response = await fetch(
        `${deployURLs.backendURL}/api/thankYouData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: thankYouMessage }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        toast.success("Successfully changed thank you notes!");
        setThankYouMessage("");
      } else toast.error("Error: " + data.message);
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
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
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
      <button onClick={handleWelcomeDataUpload}>Upload</button>
      <ToastContainer />
      <br />
      <br />
      <h1>Thank you screen notes</h1>
      <label>
        Thank you message:{" "}
        <input
          type="text"
          id="thank-you-message"
          placeholder="Message"
          value={thankYouMessage}
          onChange={(e) => setThankYouMessage(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleThankYouDataUpload}>Upload</button>
    </div>
  );
};

export default Notes;
