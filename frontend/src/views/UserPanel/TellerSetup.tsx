import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deployURLs } from "./../../../public/constants";
import './../../styles/UserPanel/tellerSetup.scss';
import logo from './../../../public/feedtrackLogoBlack.svg';

const TellerSetup = () => {
    const [branches, setBranches] = useState([]);
    const [tellers, setTellers] = useState([]);
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTeller, setSelectedTeller] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch branches from the API when component mounts
        fetch(`${deployURLs.backendURL}/api/branches`)
            .then(response => response.json())
            .then(data => setBranches(data))
            .catch(error => console.error('Error fetching branches:', error));

        // Fetch tellers from the API when component mounts
        fetch(`${deployURLs.backendURL}/api/tellers`)
            .then(response => response.json())
            .then(data => setTellers(data))
            .catch(error => console.error('Error fetching tellers:', error));
    }, []);

    const handleBranchLocationChange = (event) => {
        const selectedLocation = event.target.value;
        setBranchLocation(selectedLocation);
        const selectedBranch = branches.find(branch => branch.location === selectedLocation);
        setSelectedBranch(selectedBranch);
    };

    const handleTellerSelect = (event) => {
        const selectedTellerId = event.target.value;
        const selectedTeller = tellers.find(teller => teller.id === selectedTellerId);
        setSelectedTeller(selectedTeller);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Simulate sending data to the server
        const data = {
            selectedBranch,
            selectedTeller
        };
        console.log('Submitted data:', data);

        // Redirect to /userFeedback after submission
        navigate('/userFeedback');
    };

    return (
        <div className="teller-setup-container">
            <img src={logo} alt="Feedtrack Logo" className="logo" />
            <h2>Teller Setup</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="branchLocation">Branch Location:</label>
                    <select id="branchLocation" value={branchLocation} onChange={handleBranchLocationChange}>
                        <option value="">Select Branch Location</option>
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.location}>{branch.location}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="selectedTeller">Select Teller:</label>
                    <select id="selectedTeller" value={selectedTeller ? selectedTeller.id : ''} onChange={handleTellerSelect}>
                        <option value="">Select Teller</option>
                        {tellers.map(teller => (
                            <option key={teller.id} value={teller.id}>{teller.id}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default TellerSetup;
