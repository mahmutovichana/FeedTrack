import React from 'react';
import {useNavigate} from "react-router-dom";
import "./footer.scss"

const Footer = () => {
    return (
        <div className="footer">
            <span>Administrator</span>
            <span>© FeedTrack Admin Dashboard</span>
        </div>
    )
}

export default Footer;