import React, { useEffect, useState } from 'react';
import { deployURLs } from "../../../public/constants.js";
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import "./../../styles/AdminPanel/assignCampaigns.scss";

import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./../../styles/AdminPanel/forms.scss";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface Branch {
    id: number;
    location: string;
    area: string;
}

interface Campaign {
    id: number;
    name: string;
    [key: string]: any;
}

const AssignCampaigns = () => {
    console.error = () => {};

    const [areas, setAreas] = useState<string[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranches, setSelectedBranches] = useState<{ [key: string]: number[] }>({});
    const [openArea, setOpenArea] = useState<string | null>(null); // Novo stanje za praćenje otvorenog kantona
    let [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);


    const handleStartDateSelect = (date: Date) => {
        setStartDate(date);
    };

    const handleEndDateSelect = (date: Date) => {
        setEndDate(date);
    };

    const handleAreaChange = async (area: string) => {
        if (openArea === area) {
            setOpenArea(null); // Ako je kliknut ponovno, zatvori meni

        } else {
            setOpenArea(area);
            // Dobijanje svih filijala koje pripadaju odabranom kantonu
            fetch(`${deployURLs.backendURL}/api/branches/by-area/${area}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok');
                    }
                })
                .then(data => {
                    setBranches(data);
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                });
        }
    };

    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/campaigns`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then(data => {
                setCampaigns(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        // Dobijanje svih jedinstvenih area vrijednosti sa backenda
        fetch(`${deployURLs.backendURL}/api/branches/areas`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then(data => {
                setAreas(data);
            })
            .catch(error => {
                console.error('Error fetching areas:', error);
            });
    }, []);


    const handleBranchCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, area: string, branchId: number) => {
        const checked = event.target.checked;
        const updatedSelectedBranches = { ...selectedBranches };
    
        if (checked) {
            updatedSelectedBranches[area] = [...(updatedSelectedBranches[area] || []), branchId];
        } else {
            updatedSelectedBranches[area] = (updatedSelectedBranches[area] || []).filter(id => id !== branchId);
        }
    
        setSelectedBranches(updatedSelectedBranches);
    };
    

    const handleAreaCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, area: string) => {
        const checked = event.target.checked;
        if (checked) {
            setSelectedBranches(prevState => ({
                ...prevState,
                [area]: branches.filter(branch => branch.area === area).map(branch => branch.id)
            }));
            setOpenArea(area);
        } else {
            setSelectedBranches(prevState => {
                const updatedSelectedBranches = { ...prevState };
                delete updatedSelectedBranches[area];
                return updatedSelectedBranches;
            });
            setOpenArea(null);
        }
    };
    
    const handleToggleBranches = (area: string) => {
        const allBranchesSelected = branches
            .filter(branch => branch.area === area)
            .every(branch => selectedBranches[area]?.includes(branch.id));

        if (allBranchesSelected) {
            setSelectedBranches(prevState => {
                const updatedSelectedBranches = { ...prevState };
                updatedSelectedBranches[area] = [];
                return updatedSelectedBranches;
            });
        } else {
            setSelectedBranches(prevState => {
                const updatedSelectedBranches = { ...prevState };
                updatedSelectedBranches[area] = branches
                    .filter(branch => branch.area === area)
                    .map(branch => branch.id);
                return updatedSelectedBranches;
            });
        }
    };


    const handleSubmit = async () => {
        try {
            if (!selectedCampaign) { toast.error("Please select a campaign!"); return; }
            if (!startDate || !endDate) { toast.error("Please select start and end dates!"); return; }
            if (startDate >= endDate) { toast.error("Start date must be before end date!"); return; }
            if (Object.keys(selectedBranches).length === 0) { toast.error("No branches selected!"); return; }

            // Prvo ažurirajte kampanju sa izabranim datumima
            const campaignUpdateResponse = await fetch(`${deployURLs.backendURL}/api/campaigns/${selectedCampaign.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate
                })
            });

            if (!campaignUpdateResponse.ok) {
                throw new Error('Failed to update campaign');
            }

            for (const area in selectedBranches) {
                const branchIds = selectedBranches[area];
                await Promise.all(branchIds.map(async branchId => {
                    try {
                        const response = await fetch(`${deployURLs.backendURL}/api/branches/${branchId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ campaignID: selectedCampaign.id })
                        });
                        if (!response.ok) {
                            throw new Error('Failed to update branch');
                        }
                        // Pronalaženje imena kampanje na osnovu ID-a
                        toast(`Successfully assigned campaign ${selectedCampaign.name} to branch!`);
                    } catch (error) {
                        console.error(error);
                    }
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCampaignChange = (event: SelectChangeEvent<number>) => {
        const selectedCampaignValue = event.target.value;
        setSelectedCampaign(campaigns.find(campaign => campaign.id === selectedCampaignValue));
    };

    return (
        <div className='formsContainer'>
            <h1>Branches by Area</h1>
            <p>Assign campaigns to branches listed below!</p>

            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <Select
                        value={selectedCampaign ? selectedCampaign.id : ""}
                        onChange={handleCampaignChange}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Select campaign</MenuItem>
                        {campaigns.map((campaign) => (
                            <MenuItem key={campaign.id} value={campaign.id}>
                                {campaign.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '10px' }}>Start Date</h3>
                    <DayPicker
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '10px' }}>End Date</h3>
                    <DayPicker
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                    />
                </div>
            </div>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {areas.map((area, index) => (
                    <div key={index} className="areaContainer">
                        <label className="areaLabel" onClick={() => handleAreaChange(area)}>
                            <Checkbox
                                onChange={(event) => handleAreaCheckboxChange(event, area)}
                                checked={!!selectedBranches[area]}
                                color="primary"
                                className="areaCheckbox"
                            />
                            <span className="areaText">{area}</span>
                            <span className={`arrow ${openArea === area ? 'open' : ''}`}>&#9660;</span>
                        </label>
                        {openArea === area && ( // Prikaži filijale samo ako je kanton otvoren
                            branches.map(branch => (
                                <div key={branch.id} className="branchContainer">
                                    <Checkbox
                                        checked={selectedBranches[area]?.includes(branch.id)}
                                        onChange={(event) => handleBranchCheckboxChange(event, area, branch.id)}
                                        color="primary"
                                        className="branchCheckbox"
                                    />
                                    <span className="branchText">{branch.location}</span>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </Box>


            <Button variant="contained" onClick={handleSubmit} style={{ marginTop: '20px', fontFamily: "Montserrat" }}>Submit</Button>
            <ToastContainer />
        </div>
    );
};

export default AssignCampaigns;