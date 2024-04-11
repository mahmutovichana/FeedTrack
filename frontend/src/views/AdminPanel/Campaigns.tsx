import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/AdminPanel/feedbacks.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';
import Update from '../../components/update/Update';
import { deployURLs } from "./../../../public/constants";

interface Campaign {
    id: number;
    [key: string]: any;
}

const Campaigns = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [refreshData, setRefreshData] = useState(false);

    // get all feedbacks for the table
    useEffect(() => {
        fetch(`${deployURLs.backendURL}/api/campaigns`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`, 
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data: Campaign[]) => {
                if (data.length > 0) {
                    const campaign = data[0];
                    const campaignKeys = Object.keys(campaign);
                    const generatedColumns = campaignKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof campaign[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setCampaigns(data);
                }
            })
            .catch((error) => console.error('Error fetching campaigns:', error));
    }, []);

    // handle deleting a campaign
    const deleteCampaign = (id: number) => {
        fetch(`${deployURLs.backendURL}/api/campaigns/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`, 
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    const updatedCampaigns = campaigns.filter(campaign => campaign.id !== id);
                    setCampaigns(updatedCampaigns);
                } else {
                    console.error('Error deleting campaign:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting campaign:', error));
    };

    // check if admin is authorized to see and use CRUD 
    let isValidAdmin = false;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) console.error("User data not found in localStorage");
    else {
        const userData = JSON.parse(userDataString);
        if (userData && userData.role) {
            isValidAdmin = (userData.role === 'superAdmin') || (userData.role === 'branchAdmin') || (userData.role === 'tellerAdmin');
            console.log("User: ", userData);
            console.log("Am I a valid admin? ", isValidAdmin);
        } else {
            console.error("Role not found in user data");
        }
    }

    const toggleRefreshData = () => {
        setRefreshData(prevState => !prevState);
      };

    return (
        <div className="campaigns">
            <div className="info">
                <h1>Campaigns</h1>
                {isValidAdmin && (
                    <>
                        <button onClick={() => setOpenAdd(true)}>Add</button>
                        <button onClick={() => setOpenUpdate(true)}>Update</button>
                    </>
                )}
            </div>
            <DataTable slug="campaigns" columns={columns} rows={campaigns} onDelete={deleteCampaign} />
            {openAdd && <Add slug="campaign" columns={columns} setOpen={setOpenAdd} toggleRefreshData={toggleRefreshData}/>}
            {openUpdate && <Update slug="campaign" columns={columns} setOpen={setOpenUpdate} toggleRefreshData={toggleRefreshData}/>}
        </div>
    );
};

export default Campaigns;