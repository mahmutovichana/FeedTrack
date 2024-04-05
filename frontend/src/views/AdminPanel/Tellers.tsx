import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './tellers.scss';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from './../../components/dataTable/DataTable';
import Add from '../../components/add/Add';

interface Teller {
    id: number;
    [key: string]: any;
}

const Tellers = () => {
    const [open, setOpen] = useState(false);
    const [tellers, setTellers] = useState<Teller[]>([]); 
    const [columns, setColumns] = useState<GridColDef[]>([]);

    useEffect(() => {
        fetch(`https://feedtrack-backend.vercel.app/api/tellers`)
            .then((response) => response.json())
            .then((data: Teller[]) => {
                if (data.length > 0) {
                    const teller = data[0];
                    const tellerKeys = Object.keys(teller);
                    const generatedColumns = tellerKeys.map((key) => {
                        return {
                            field: key,
                            headerName: key.charAt(0).toUpperCase() + key.slice(1),
                            width: 150,
                            type: typeof teller[key] === 'boolean' ? 'boolean' : 'string',
                        };
                    }).filter(column => column !== null) as GridColDef[];
                    setColumns(generatedColumns);
                    setTellers(data);
                }
            })
            .catch((error) => console.error('Error fetching tellers:', error));
    }, []);

    const deleteTeller = (id: number) => {
        fetch(`https://feedtrack-backend.vercel.app/api/tellers/${id}`, {
            method: 'DELETE'
        })
            .then((response) => {
                if (response.ok) {
                    const updatedTellers = tellers.filter(teller => teller.id !== id);
                    setTellers(updatedTellers);
                } else {
                    console.error('Error deleting teller:', response.statusText);
                }
            })
            .catch((error) => console.error('Error deleting teller:', error));
    };

    return (
        <div className="tellers">
            <div className="info">
                <h1>Tellers</h1>
                <button onClick={() => setOpen(true)}>Add New Teller</button>
            </div>
            <DataTable slug="tellers" columns={columns} rows={tellers} onDelete={deleteTeller} />
            {open && <Add slug="teller" columns={columns} setOpen={setOpen} />}
        </div>
    );
};

export default Tellers;
