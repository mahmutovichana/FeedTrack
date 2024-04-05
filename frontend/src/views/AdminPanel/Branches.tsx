import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './branches.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/dataTable/DataTable';
import Add from '../../components/add/Add';

interface Branch {
    id: number;
    [key: string]: any;
}

const Branches = () => {
    const [open, setOpen] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]); 
    const [columns, setColumns] = useState<GridColDef[]>([]);

    useEffect(() => {
        fetch(`https://feedtrack-backend.vercel.app/api/branches`)
            .then((response) => response.json())
            .then((data: Branch[]) => {
                if (data.length > 0) {
                    const branch = data[0];
                    const branchKeys = Object.keys(branch);
                    const generatedColumns = branchKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof branch[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setBranches(data);
                }
            })
            .catch((error) => console.error('Error fetching branches:', error));
    }, []);

    const deleteBranch = (id: number) => {
        fetch(`https://feedtrack-backend.vercel.app/api/branches/${id}`, {
            method: 'DELETE'
        })
            .then((response) => {
                if (response.ok) {
                    const updatedBranches = branches.filter(branch => branch.id !== id);
                    setBranches(updatedBranches);
                } else {
                    console.error('Error deleting branch:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting branch:', error));
    };

    return (
        <div className="branches">
            <div className="info">
                <h1>Branches</h1>
                <button onClick={() => setOpen(true)}>Add New Branch</button>
            </div>
            <DataTable slug="branches" columns={columns} rows={branches} onDelete={deleteBranch} />
            {open && <Add slug="branch" columns={columns} setOpen={setOpen} />}
        </div>
    );
};

export default Branches;
