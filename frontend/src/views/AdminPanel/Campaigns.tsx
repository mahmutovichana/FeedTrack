import React, { useEffect, useState } from 'react';
import { deployURLs } from "../../../public/constants.js";
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import "./../../styles/AdminPanel/campaigns.scss";

import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./../../styles/AdminPanel/forms.scss";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Branch {
    id: number;
    location: string;
    area: string;
}

interface Campaign {
    id: number;
    [key: string]: any;
}

const Campaigns = () => {
    const [areas, setAreas] = useState<string[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranches, setSelectedBranches] = useState<{ [key: string]: number[] }>({});

    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

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
            console.log('Data received successfully:', data);
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

    const handleAreaChange = async (area: string) => {
        if (selectedArea === area) {
            setSelectedArea('');
        } else {
            setSelectedArea(area);
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

    const handleBranchCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, area: string, branchId: number) => {
        const checked = event.target.checked;
        if (checked) {
            setSelectedBranches(prevState => ({
                ...prevState,
                [area]: [...(prevState[area] || []), branchId]
            }));
        } else {
            setSelectedBranches(prevState => ({
                ...prevState,
                [area]: (prevState[area] || []).filter(id => id !== branchId)
            }));
        }
    };

    const handleAreaCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, area: string) => {
        const checked = event.target.checked;
        if (checked) {
            setSelectedBranches(prevState => ({
                ...prevState,
                [area]: branches.filter(branch => branch.area === area).map(branch => branch.id)
            }));
        } else {
            setSelectedBranches(prevState => {
                const updatedSelectedBranches = { ...prevState };
                delete updatedSelectedBranches[area];
                return updatedSelectedBranches;
            });
        }
    };

    const handleSubmit = () => {
        console.log(selectedBranches);
    };

    const handleCampaignChange = (event: SelectChangeEvent<Campaign>) => {
        const selectedCampaignValue = event.target.value as Campaign;
        setSelectedCampaign(selectedCampaignValue);
        console.log("ovo je selectedCampaign: " + selectedCampaignValue);
      };

    return (
        <div className='formsContainer'>
            <h1>Branches by Area</h1>
            <p>Assign campaigns to branches listed below!</p>
            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <Select
                        value={selectedCampaign || ""}
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
                            <span className={`arrow ${selectedArea === area ? 'open' : ''}`}>&#9660;</span>
                        </label>
                        {selectedArea === area &&
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
                        }
                    </div>
                ))}
            </Box>
            <Button variant="contained" onClick={handleSubmit} style={{ marginTop: '20px', fontFamily: "Montserrat" }}>Submit</Button>
        </div>
    );
};

export default Campaigns;
