import React, { useEffect, useState } from "react";
import "./../../styles/AdminPanel/notes.scss";
import { deployURLs } from "../../../public/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import Select from 'react-select';
import { components } from 'react-select';

// For styling dropdown list for teasers (display label with image in dropdown list)
const customStyles = {
  dropdownIndicator: (provided, state) => ({
    ...provided,
    width: '50px', // Adjust the width of the dropdown indicator
    height: '30px', // Adjust the height of the dropdown indicator
  }),
  menu: (provided, state) => ({
    ...provided,
    height: '200px', // Adjust the height of the dropdown menu
    width: '200px', // Adjust the width of dropdown the menu
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px solid #ccc',
    color: state.isSelected ? 'white' : 'black',
    backgroundColor: state.isSelected ? '#1E90FF' : 'white',
    '&:hover': {
      backgroundColor: '#1E90FF',
      color: 'white',
    },
  }),
};

// For styling dropdown list for teasers (display label with image in dropdown list)
const CustomOption = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
      {props.data.image && (
        <img
          src={props.data.image}
          alt={`Preview for ${props.data.label}`}
          style={{ width: '100px', height: '70px', marginBottom: '5px' }}
        />
      )}
      <span style={{ marginLeft: '10px' }}>{props.data.label}</span>
    </div>
  </components.Option>
);

const Notes = () => {
  const [file, setFile] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [teaserLink, setTeaserLink] = useState("");
  const [teaserName, setTeaserName] = useState("");
  const [teaserData, setTeaserData] = useState([]);
  const [selectedTeaser, setSelectedTeaser] = useState(0);
  const [teaserFile, setTeaserFile] = useState(null);
  const [options, setOptions] = useState([]);
  const [showTeaserUpload, setShowTeaserUpload] = useState(false);
  const [showTeaserUpdate, setShowTeaserUpdate] = useState(false);
  const [showTeaserDelete, setShowTeaserDelete] = useState(false);
  const [welcomeData, setWelcomeData] = useState({ image: null, message: "" });
  const [thankYouData, setThankYouData] = useState({ image: null, message: "" });
  const [teaserImage, setTeaserImage] = useState("");

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

  const fetchTeaserData = async () => {
    try {
      const response = await fetch(`${deployURLs.backendURL}/api/teaserData`);
      if (!response.ok) {
        throw new Error(`Error fetching teaser data: ${response.status}`);
      }
      const data = await response.json();
      setTeaserData(data);
    } catch (error) {
      console.error('Error fetching teaser data:', error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchTeaserData();
      await fetchData("welcomeData", setWelcomeData);
      await fetchData("thankYouData", setThankYouData);
      const teaserImage = await retrieveTeaserImage();
      setTeaserImage(teaserImage);
    };
    fetch();
  }, []);

  useEffect(() => {
    setOptions(teaserData.map((teaser, index) => ({
      value: index,
      label: teaser.name || `Teaser ${index + 1}`,
      image: teaser.image,
    })));
  }, [teaserData]);

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

  const handleTeaserSelection = (selectedOption) => {
    setSelectedTeaser(selectedOption.value);
  };

  const handleTeaserLinkChange = (e) => {
    setTeaserLink(e.target.value);
  };

  const handleTeaserNameChange = (e) => {
    setTeaserName(e.target.value);
  };

  const handleTeaserUpload = async () => {
    if (!teaserLink) {
      toast.error("Please provide a link for teaser video.");
      return;
    }
    const videoRegex = /^[^\\/:*?"<>|]+\.(mp4|avi|mov|mkv|flv|wmv|mpg|mpeg|webm)$/i;
    if (!videoRegex.test(teaserLink)) {
      toast.error("Please provide a valid video file name (\\ : / * ? \" < > | symbols are forbidden) with a supported extension (.mp4 .avi .mov .mkv .flv .wmv .mpg .mpeg .webm).");
      return;
    }
    let compressedFile;
    try {
      compressedFile = await imageCompression(teaserFile, {
        maxWidthOrHeight: 200,
      });
    } catch (err) {
      console.log(compressedFile);
    }
    try {
      let base64;
      if (compressedFile) {
        base64 = await convertToBase64(compressedFile);
      }
      else {
        base64 = "NoImgURL";
      }
      let url, method;
      if (showTeaserUpdate) {
        url = `${deployURLs.backendURL}/api/teaserData/${teaserData[selectedTeaser].id}`;
        method = "PUT";
      } else {
        url = `${deployURLs.backendURL}/api/teaserData`;
        method = "POST";
      }
      console.log("selected teaser: " + selectedTeaser);
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64, teaser: teaserLink, name: teaserName }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        if (showTeaserUpload) {
          toast.success("Successfully uploaded teaser!");
        }
        else {
          toast.success("Successfully updated teaser!");
        }
        setTeaserFile(null);
        setTeaserLink("");
        setTeaserName("");
        setShowTeaserUpload(false);
        setShowTeaserUpdate(false);
        fetchTeaserData();
      } else toast.error("Error: " + data.message);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteTeaser = async () => {
    try {
      const response = await fetch(
        `${deployURLs.backendURL}/api/teaserData/${teaserData[selectedTeaser]?.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        if (response.status === 204) {
          toast.success("Teaser deleted successfully!");
          setShowTeaserDelete(false);
          setSelectedTeaser(0);
          fetchTeaserData();
        } else {
          toast.error("Error deleting teaser!");
        }
      } else {
        toast.error("Error deleting teaser!");
      }
    } catch (error) {
      console.error("Error deleting teaser:", error);
    }
  };

  const handleFileChange = (e, setData) => {
    setData({ ...setData, image: e.target.files[0] });
  };

  const handleTeaserFileChange = (e) => {
    setTeaserFile(e.target.files[0]);
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
  const handleSelectButton = async () => {
    localStorage.setItem('teaserVideo', teaserData[selectedTeaser].teaser);
    toast.success("Teaser selected!");
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

  const retrieveTeaserImage = async () => {
    try {
      const response = await fetch(`${deployURLs.backendURL}/api/teaserData/getImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teaser: localStorage.getItem("teaserVideo")}),
      });

      const responseData = await response.json();

      if (response.ok) {
        return responseData[0].image;
      } else {
        toast.error("Error: " + responseData.message);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  // when updating teaser, populate teaser link and name input field with existing value
  useEffect(() => {
    if (showTeaserUpdate) {
      setTeaserLink(teaserData[selectedTeaser]?.teaser);
      setTeaserName(teaserData[selectedTeaser]?.name);
    }
    else {
      setTeaserLink("");
      setTeaserName("");
    }
  }, [selectedTeaser, showTeaserUpdate]);

  return (
    <div className="notes">
      <div className="teaser-screen">
        <h1>Teaser Screen Selection</h1>
        <label>Select Teaser:</label>
        <div className="teaserDisplay">
          <Select
            options={options}
            value={options.find((option) => option.value === selectedTeaser)}
            onChange={handleTeaserSelection}
            styles={customStyles}
            components={{ Option: CustomOption }}
          />
          {selectedTeaser !== null && (
            <img
              src={options[selectedTeaser]?.image}
              alt={`Preview for Teaser ${selectedTeaser + 1}`}
              style={{ width: '160px', height: '120px', marginLeft: '10px' }}
            />
          )}
        </div>
        <br />
        {(!showTeaserUpload && !showTeaserUpdate && !showTeaserDelete) && (
          <div className="centerButton">
            <button onClick={handleSelectButton}>
              Select this teaser
            </button>
          </div>
        )}
        <br />
        {(showTeaserUpload || showTeaserUpdate) && ( // Only show the upload section when showTeaserUpload or showTeaserUpdate is true
          <>
            <label>
              Teaser name:{" "}
              <input
                type="text"
                id="teaser-name"
                placeholder="Teaser name"
                value={teaserName}
                onChange={handleTeaserNameChange}
              />
            </label>
            <br />
            <label>
              Teaser link:{" "}
              <input
                type="text"
                id="teaser-link"
                placeholder="Teaser link"
                value={teaserLink}
                onChange={handleTeaserLinkChange}
              />
            </label>
            <br />
            <label>
              Upload Preview Image:{" "}
              <input
                type="file"
                id="file"
                accept=".jpeg, .png, .jpg"
                onChange={handleTeaserFileChange}
              />
            </label>
            <br />
            <div className="teaser-buttons-container">
              <button onClick={handleTeaserUpload}>Upload</button>
              <button onClick={() => { setShowTeaserUpload(false); setShowTeaserUpdate(false); }}>Cancel</button>
            </div>
          </>
        )}
        {(showTeaserDelete) && ( // Only show the delete section when showTeaserDelete is true
          <>
            <label>
              Are you sure?
            </label>
            <br />
            <div className="teaser-buttons-container">
              <button onClick={handleDeleteTeaser}>Yes</button>
              <button onClick={() => { setShowTeaserDelete(false); }}>No</button>
            </div>
          </>
        )}
        <div className="teaser-buttons-container">
          {(!showTeaserUpload && !showTeaserUpdate && !showTeaserDelete) && (
            <>
              <button onClick={() => setShowTeaserUpload(true)}>Add a teaser</button>
              <button onClick={() => setShowTeaserUpdate(true)}>Update teaser</button>
              <button onClick={() => setShowTeaserDelete(true)}>Delete teaser</button>
            </>
          )}
        </div>
      </div>
      <br />
      <br />
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
          {welcomeData.message && (<img
            src="/delete.svg"
            alt="Delete"
            onClick={() => setWelcomeData({ ...welcomeData, message: "" })}
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          />)}
        </label>
        <br />
        <label>
          Image:{" "}
          <input
            type="file"
            accept=".jpeg, .png, .jpg, .svg"
            onChange={(e) => handleFileChange(e, setWelcomeData)}
          />
          {welcomeData.image && (<img
            src="/delete.svg"
            alt="Delete"
            onClick={() => setWelcomeData({ ...welcomeData, image: null })}
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          />)}
        </label>
        <br />
        <button onClick={() => handleDataUpload("welcomeData", welcomeData, setWelcomeData)}>Upload</button>
      </div>
      <div className="thank-you-screen">
        <h1>Thank you screen notes</h1>
        <label>
          Thank you message:{" "}
          <input
            type="text"
            placeholder="Message"
            value={thankYouData.message}
            onChange={(e) => setThankYouData({ ...thankYouData, message: e.target.value })}
          />
          {thankYouData.message && (<img
            src="/delete.svg"
            alt="Delete"
            onClick={() => setThankYouData({ ...thankYouData, message: "" })}
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          />)}
        </label>
        <br />
        <label>
          Image:{" "}
          <input
            type="file"
            accept=".jpeg, .png, .jpg"
            onChange={(e) => handleFileChange(e, setThankYouData)}
          />
          {thankYouData.image && (<img
            src="/delete.svg"
            alt="Delete"
            onClick={() => setThankYouData({ ...thankYouData, image: null })}
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          />)}
        </label>
        <br />
        <button onClick={() => handleDataUpload("thankYouData", thankYouData, setThankYouData)}>Upload</button>
      
      </div>
    
      <div>
        <h2>Current data</h2>
        <h3>Teaser Screen</h3>
        {teaserImage && <img className="currentDataImg" src={teaserImage} alt="Teaser Screen" />}
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