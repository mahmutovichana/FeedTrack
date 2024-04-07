import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.scss';
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";

const Layout = () => {
    return (
        <div className="layout">
            <div className="main">
                <Navbar />
                <div className="container">
                    <div className="menuContainer">
                        <Menu />
                    </div>
                    <div className="contentContainer">
                        <Outlet />
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
