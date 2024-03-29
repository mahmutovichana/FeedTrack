import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";


const AdminHomePage = () => {

    const { state } = useLocation();
    const [username, setUsername] = useState();
    const [accessToken, setAccessToken] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const logoutBtn = document.getElementById("logout");
        const refreshBtn = document.getElementById("refresh");
        if (state != null) {
            setUsername(state.username)
            setAccessToken(state.accessToken)
        }

        //if(localStorage.getItem("refreshToken") == null) navigate('/')

    }, []);

    async function logoutLogic(event){
        event.preventDefault();
        console.log(JSON.stringify({"refreshToken": localStorage.getItem("refreshToken")}));
        try {
            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"refreshToken": localStorage.getItem("refreshToken")})
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
    async function refreshLogic(event){
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"refreshToken": localStorage.getItem("refreshToken")})
            });
            console.log("accessToken before refresh",localStorage.getItem("accessToken"));
            if (response.ok) {
                // Handle successful login
                console.log('Refresh successful');
                let responseData = await response.json()
                localStorage.setItem('accessToken', responseData.accessToken);
                setAccessToken(responseData.accessToken);
                console.log("accessToken is now valid for 30 minutes");
                console.log("accessToken after refresh",localStorage.getItem("accessToken"));
                //localStorage.removeItem("refreshToken")
                //localStorage.removeItem("username")
                //localStorage.removeItem("accessToken")
                navigate('/homePage', { state: { "username": responseData.username, "refreshToken": responseData.refreshToken, "accessToken": responseData.accessToken } });
            } else {
                // Handle login error
                console.error('Refresh failed');
            }
        } catch (error) {
            console.error('Error refreshing:', error);
        }
    }

    return (
        <div>
            <h1>Testni naslov za {username}</h1>
            <button id="logout" onClick={logoutLogic}>Log Out</button>
            <button id="refresh" onClick={refreshLogic}>Refresh</button>
            <p>After refresh new token will be valid for 30 minutes</p>
            <p>Currently active access token {accessToken}</p>
        </div>
    );
}

export default AdminHomePage;
