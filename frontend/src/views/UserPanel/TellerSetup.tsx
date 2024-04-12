import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deployURLs } from "./../../../public/constants";
import './../../styles/UserPanel/tellerSetup.scss';
import logo from './../../../public/feedtrackLogoBlack.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TellerSetup = () => {
    const [branches, setBranches] = useState([]);
    const [tellers, setTellers] = useState([]);
    const [branchLocation, setBranchLocation] = useState('');
    const [selectedTeller, setSelectedTeller] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const navigate = useNavigate();

    // const campaignID = localStorage.getItem('campaignID');
    // const tellerPositionID = localStorage.getItem('tellerPositionID');
    // const storedBranchLocation = localStorage.getItem('storedBranchLocation');

    useEffect(() => {
        const selectedTellerId = localStorage.getItem('selectedTellerID');
        if (selectedTellerId && selectedBranch) {
            // If it is already set up, redirect the user to the userFeedback page
            navigate('/userFeedback');
        }
    }, []);

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
        localStorage.branchPositionID = selectedBranch.id;
        localStorage.storedBranchLocation = selectedBranch.location;
    };

    const handleTellerSelect = (event) => {
        const selectedTellerId = event.target.value;
        const selectedTeller = tellers.find(teller => teller.id === selectedTellerId);
        setSelectedTeller(selectedTeller);

        localStorage.tellerPositionID = selectedTeller.id;
    };

    const handleSubmit = async (event) => {

        event.preventDefault();
        
        if (!selectedBranch || !selectedTeller) {
            toast.error("Please select both the branch and the teller!");
            return;
        }
        // API ruta za dohvaćanje svih kampanja i pronalazak odgovarajuće kampanje
        const response = await fetch(`${deployURLs.backendURL}/api/campaigns`);
        const campaigns = await response.json();
        const storedCampaign = campaigns.find(campaign => selectedBranch.campaignID === campaign.id);

        console.log(campaigns);

        if (!storedCampaign) {
            toast.error('No campaign going on at the moment :('); return;
        }

        localStorage.setItem('campaignID', storedCampaign.id);
        localStorage.setItem('pageSize', storedCampaign.questionsperpage);

        // Simulate sending data to the server
        const data = {
            selectedBranch,
            selectedTeller
        };
        console.log('Submitted data:', data);
        localStorage.setItem('selectedBranch', JSON.stringify(selectedBranch));
        localStorage.setItem('selectedTeller', JSON.stringify(selectedTeller));

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
                        {selectedBranch && tellers.filter(teller => teller.branchID === selectedBranch.id).map(teller => (
                            <option key={teller.id} value={teller.id}>{teller.id}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default TellerSetup;
