import React, { useState, useEffect } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

const Notes = () => {
  const [welcomeData, setWelcomeData] = useState({ image: null, message: "" });
  const [thankYouData, setThankYouData] = useState({ image: null, message: "" });

  useEffect(() => {
    fetchData("welcomeData", setWelcomeData);
    fetchData("thankYouData", setThankYouData);
  }, []);

  const fetchData = async (dataType, setData) => {
    try {
      const response = await fetch(`${deployURLs.backendURL}/api/${dataType}`, { method: "GET" });
      const data = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error.message);
    }
  };

  const convertToBase64 = async (file) => {
    try {
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 200,
      });
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
      return base64;
    } catch (error) {
      throw new Error("Error compressing file: " + error.message);
    }
  };

  const handleFileChange = (e, setData) => {
    setData({ ...setData, image: e.target.files[0] });
  };

  const handleDataUpload = async (dataType, data, setFunction) => {
    try {
      if (!data.image && !data.message) {
        const response = await fetch(`${deployURLs.backendURL}/api/${dataType}`, { method: "DELETE" });
        if (response.ok) {
          toast.success(`Successfully deleted ${dataType} data!`);
          setFunction({ image: null, message: "" });
        } else {
          const responseData = await response.json();
          toast.error("Error: " + responseData.message);
        }
        return;
      }

      const base64 = data.image ? await convertToBase64(data.image) : "";

      const response = await fetch(`${deployURLs.backendURL}/api/${dataType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64, message: data.message }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`Successfully changed ${dataType} notes!`);
        setFunction({ image: null, message: "" });
      } else {
        toast.error("Error: " + responseData.message);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  return (
    <div className="notes">
      <div>
        <h1>Welcome screen notes</h1>
        <label>
          Welcome message:{" "}
          <input
            type="text"
            placeholder="Message"
            value={welcomeData.message}
            onChange={(e) => setWelcomeData({ ...welcomeData, message: e.target.value })}
          />
          {welcomeData.message && (
            <button onClick={() => setWelcomeData({ ...welcomeData, message: "" })}>X</button>
          )}
        </label>
        <br />
        <label>
          Upload image:{" "}
          <input
            type="file"
            accept=".jpeg, .png, .jpg, .svg"
            onChange={(e) => handleFileChange(e, setWelcomeData)}
          />
          {welcomeData.image && (
            <button onClick={() => setWelcomeData({ ...welcomeData, image: null })}>X</button>
          )}
        </label>
        <br />
        <button onClick={() => handleDataUpload("welcomeData", welcomeData, setWelcomeData)}>Upload</button>
      </div>
      <div>
        <h1>Thank you screen notes</h1>
        <label>
          Thank you message:{" "}
          <input
            type="text"
            placeholder="Message"
            value={thankYouData.message}
            onChange={(e) => setThankYouData({ ...thankYouData, message: e.target.value })}
          />
          {thankYouData.message && (
            <button onClick={() => setThankYouData({ ...thankYouData, message: "" })}>X</button>
          )}
        </label>
        <br />
        <label>
          Upload image:{" "}
          <input
            type="file"
            accept=".jpeg, .png, .jpg"
            onChange={(e) => handleFileChange(e, setThankYouData)}
          />
          {thankYouData.image && (
            <button onClick={() => setThankYouData({ ...thankYouData, image: null })}>X</button>
          )}
        </label>
        <br />
        <button onClick={() => handleDataUpload("thankYouData", thankYouData, setThankYouData)}>Upload</button>
      </div>
      <div>
        <h2>Current data</h2>
        <h3>Welcome data</h3>
        {welcomeData.message && <p>Welcome message: {welcomeData.message}</p>}
        {welcomeData.image && <img src={welcomeData.image} alt="Welcome background" />}
        <h3>Thank You data</h3>
        {thankYouData.message && <p>Thank you message: {thankYouData.message}</p>}
        {thankYouData.image && <img src={thankYouData.image} alt="Thank you background" />}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Notes;
