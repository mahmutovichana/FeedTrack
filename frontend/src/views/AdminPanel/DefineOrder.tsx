import React, { useState, useEffect } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { deployURLs } from "../../../public/constants";
import './../../styles/AdminPanel/DefineOrder.scss';
import { toast } from 'react-toastify';

const SortableItem = SortableElement(({ value }) => (
  <div style={cardStyle}>{value}</div> // Stilizacija kao kartica
));

const SortableContainer2 = SortableContainer(({ children }) => {
  return <div style={containerStyle}>{children}</div>; // Stilizacija kontejnera
});

const cardStyle = {
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '5px',
  padding: '10px',
  marginBottom: '10px',
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const DefineOrder = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [campaigns, setCampaigns] = useState([]); // all campaign data for selected branch
  const [items, setItems] = useState([]); // items displayed in drag and drop list - campaign names for selected branch
  const [finalizedList, setFinalizedList] = useState(null);

  useEffect(() => {
    // Fetch branches from the API when component mounts
    fetch(`${deployURLs.backendURL}/api/branches`)
      .then(response => response.json())
      .then(data => setBranches(data))
      .catch(error => console.error('Error fetching branches:', error));
  }, []);

  useEffect(() => {
    // Fetch campaigns for selected branch every time selection changes
    fetch(`${deployURLs.backendURL}/api/branchCampaign/byBranchID/${selectedBranch?.id}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${localStorage.token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const newItems = data.map(item => item.name);
        setItems(newItems);
        setCampaigns(data);
      })
      .catch(error => console.error('Error fetching campaigns:', error));
  }, [selectedBranch]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(prevItems => arrayMoveImmutable(prevItems, oldIndex, newIndex));
  };

  const finalizeList = () => {
    // Update localStorage map with the new order of campaigns
    const branchId = selectedBranch?.id;
    const campaignOrderMap = JSON.parse(localStorage.getItem('campaignOrderMap')) || {};
    campaignOrderMap[branchId] = items;
    localStorage.setItem('campaignOrderMap', JSON.stringify(campaignOrderMap));
    console.log(JSON.stringify(campaignOrderMap));
    
    setFinalizedList(items);
    console.log(items);
    toast(`Successfully assigned order of campaigns for ${selectedBranch.name} branch!`);
  };

  const handleBranchLocationChange = (event) => {
    const selectedLocation = event.target.value;
    const selectedBranch = branches.find(branch => branch.location === selectedLocation);
    setSelectedBranch(selectedBranch);
  };

  return (
    <div className="DragDrop">
      <h1>Define the order of campaigns</h1>
      (Drag and drop to modify)
      <div className="form-group">
        <label htmlFor="branchLocation">Branch Location:</label>
        <select id="branchLocation" onChange={handleBranchLocationChange}>
          <option value="">Select Branch Location</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.location}>{branch.location}</option>
          ))}
        </select>
      </div>
      <div className='dragAndDropContainer'>
      <SortableContainer2 onSortEnd={onSortEnd}>
          {items.map((value, index) => (
            <SortableItem key={`item-${value}`} index={index} value={value} />
          ))}
        </SortableContainer2>
      </div>
      <button onClick={finalizeList}>Confirm this order</button>
      {finalizedList && (
        <div>
          <h2>Finalizirani spisak:</h2>
          <ul>
            {finalizedList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DefineOrder;