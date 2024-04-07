import "./navbar.scss"
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { deployURLs } from "./../../../public/constants.js";

const Navbar = () => {

    const navigate = useNavigate();
    const { state } = useLocation();
    const [name, setName] = useState();
    const [token, setToken] = useState();
    const [user, setUser] = useState(null); 


    useEffect(() => {
        if (state && state.user) {
            setToken(state.token)
            setUser(state.user);
        }
    }, [state]);

    async function logoutLogic(event) {
        try {
            const response = await fetch(`${deployURLs.backendURL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "token": localStorage.getItem("token") })
            });

            if (response.ok) {
                // Handle successful logout
                console.log('Logout successful');
                localStorage.clear()
                navigate('/');
            } else {
                // Handle logout error
                console.log(response);
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }


    return (
        <div className="navbar">
            <div className="logo">
                <img src="feedtrackLogo.png" alt="" />
                <h1>Admin Dashboard</h1>
            </div>
            <div className="icons">
                <button id="logout" onClick={logoutLogic}>Log Out</button>
                <img src="/search.svg" alt="" className="icon" />
                <img src="/app.svg" alt="" className="icon" />
                <img src="/expand.svg" alt="" className="icon" />
                <div className="notification">
                    <img src="/notifications.svg" alt="" />
                    <span>1</span>
                </div>
                <div className="user">
                    <img src="https://images.pexels.com/photos/11038549/pexels-photo-11038549.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load" alt="" />
                    {user && <span>Hello {user.name}</span>}
                </div>
                <img src="/setting.svg" alt="" className="icon" />
            </div>
        </div>
    );
};

export default Navbar;