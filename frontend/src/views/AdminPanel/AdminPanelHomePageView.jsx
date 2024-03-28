import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";


const AdminHomePage = () => {
    function handleCallbackResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
    }

    const { state } = useLocation();
    const [username, setUsername] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const logoutBtn = document.getElementById("logout");
        if (state != null) {
            setUsername(state.username)
        }

        if(localStorage.getItem("refreshToken") == null) navigate('/')

    }, []);

    async function logoutLogic(event){
        event.preventDefault();

        try {
            const response = await fetch('https://feedtrack-backend.vercel.app/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"refreshToken": localStorage.getItem("token")})
            });

            if (response.ok) {
                // Handle successful login
                console.log('Logout successful');
                //localStorage.clear()
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("username")
                navigate('/');
            } else {
                // Handle login error
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    return (
        <div>
            <h1>Testni naslov za {username}</h1>
            <button id="logout" onClick={logoutLogic}>Log Out</button>
        </div>
    );
}

export default AdminHomePage;
