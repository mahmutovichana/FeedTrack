import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";

const AdminHomePage = () => {

    const { state } = useLocation();
    const [username, setUsername] = useState();
    const [token, setToken] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const logoutBtn = document.getElementById("logout");
        const refreshBtn = document.getElementById("refresh");
        if (state != null) {
            setUsername(state.username)
            setToken(state.token)
        }

        //if(localStorage.getItem("refreshToken") == null) navigate('/')

    }, []);

    async function logoutLogic(event){
        event.preventDefault();
        console.log(JSON.stringify({"token": localStorage.getItem("token")}));
        try {
            const response = await fetch('https://feedtrack-backend.vercel.app/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"token": localStorage.getItem("token")})
            });

            if (response.ok) {
                // Handle successful login
                console.log('Logout successful');
                localStorage.clear()
                //localStorage.removeItem("refreshToken")
                //localStorage.removeItem("username")
                //localStorage.removeItem("accessToken")
                navigate('/');
            } else {
                // Handle login error
                console.log(response);
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
    /*
    async function refreshLogic(event){
        event.preventDefault();

        try {
            const response = await fetch('https://feedtrack-backend.vercel.app/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"token": localStorage.getItem("token")})
            });
            console.log("token before refresh",localStorage.getItem("token"));
            if (response.ok) {
                // Handle successful login
                console.log('Refresh successful');
                let responseData = await response.json()
                localStorage.setItem('token', responseData.token);
                setToken(responseData.token);
                console.log("token is now valid for 30 minutes");
                console.log("token after refresh",localStorage.getItem("token"));
                //localStorage.removeItem("refreshToken")
                //localStorage.removeItem("username")
                //localStorage.removeItem("accessToken")
                navigate('/homePage', { state: { "username": responseData.username, "token": responseData.token} });
            } else {
                // Handle login error
                console.error('Refresh failed');
            }
        } catch (error) {
            console.error('Error refreshing:', error);
        }
    }

     */

    return (
        <div>
            <h1>Testni naslov za {username}</h1>
            <button id="logout" onClick={logoutLogic}>Log Out</button>
            <p>After refresh new token will be valid for 30 minutes</p>
            <p>Currently active access token {token}</p>
        </div>
    );
}

export default AdminHomePage;
