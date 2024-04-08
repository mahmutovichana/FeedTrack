import React from 'react';
import './../../styles/AdminPanel/profile.scss';

const Profile = () => {
  
  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;

  // Placeholders for missing data or invalid/missing image URL
  const placeholderImage = 'noavatar.png'; // Path to placeholder image
  const defaultValues = {
    name: 'Name',
    lastname: 'Lastname',
    email: 'Email',
    mobilenumber: 'Mobile Number',
    role: 'Role',
  };

  return (
    <div className="profile">
      <img
        className="profile-image"
        src={userData?.image || placeholderImage}
        alt="Profile"
        onError={(e) => { e.currentTarget.src = placeholderImage; }}
      />
      <div className="user-details">
        <div className="detail">
          <label>Name:</label>
          <p>{userData?.name || defaultValues.name}</p>
        </div>
        <div className="detail">
          <label>Last name:</label>
          <p>{userData?.lastname || defaultValues.lastname}</p>
        </div>
        <div className="detail">
          <label>Email:</label>
          <p>{userData?.email || defaultValues.email}</p>
        </div>
        <div className="detail">
          <label>Mobile Number:</label>
          <p>{userData?.mobilenumber || defaultValues.mobilenumber}</p>
        </div>
        <div className="detail">
          <label>Role:</label>
          <p>{userData?.role || defaultValues.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;