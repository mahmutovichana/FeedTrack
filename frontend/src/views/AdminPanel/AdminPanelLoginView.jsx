import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import feedtrackLogo from './../../assets/feedtrackLogoBlack.svg';
import '../../styles/AdminPanel/AdminPanelLoginView.css';

const Login = () => {
    const [loginWithEmail, setLoginWithEmail] = useState(true);

    useEffect(() => {
        const container = document.getElementById('container');
        const registerBtn = document.getElementById('register');
        const loginBtn = document.getElementById('login');

        const handleRegisterClick = () => {
            container.classList.add("active");
        };

        const handleLoginClick = () => {
            container.classList.remove("active");
        };

        registerBtn.addEventListener('click', handleRegisterClick);
        loginBtn.addEventListener('click', handleLoginClick);

        // Cleanup event listeners when component unmounts
        return () => {
            registerBtn.removeEventListener('click', handleRegisterClick);
            loginBtn.removeEventListener('click', handleLoginClick);
        };
    }, []);

    const handleToggle = () => {
        setLoginWithEmail(prevState => !prevState);
    };

    return (
        <div>
            <div className="logo">
                <img src={feedtrackLogo} className="logo" alt="FeedTrack logo" />
            </div>
            <div className="container" id="container">
                <div className="form-container sign-up">
                    <form>
                        <h1>Create Account</h1>
                        <div className="options">
                            <a href="#" className={`icon ${loginWithEmail ? 'active' : ''}`} onClick={() => setLoginWithEmail(true)}>
                                <FontAwesomeIcon icon={faEnvelope} />{ }
                            </a>
                            <a href="#" className={`icon ${!loginWithEmail ? 'active' : ''}`} onClick={() => setLoginWithEmail(false)}>
                                <FontAwesomeIcon icon={faPhone} />{ }
                            </a>
                            <a href="#" className="icon">
                                <FontAwesomeIcon icon={faGooglePlusG} /> { }
                            </a>
                        </div>
                        <span>or use your {loginWithEmail ? 'email' : 'phone number'} for registration</span>
                        <input type="text" placeholder="Name" />
                        <input type={loginWithEmail ? 'email' : 'tel'} placeholder={loginWithEmail ? 'Email' : 'Phone Number'} /> {/* Promijenjen placeholder */}
                        <input type="password" placeholder="Password" />
                        <button>Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form>
                        <h1>Sign In</h1>
                        <div className="options">
                            <a href="#" className={`icon ${loginWithEmail ? 'active' : ''}`} onClick={() => setLoginWithEmail(true)}>
                                <FontAwesomeIcon icon={faEnvelope} /> { }
                            </a>
                            <a href="#" className={`icon ${!loginWithEmail ? 'active' : ''}`} onClick={() => setLoginWithEmail(false)}>
                                <FontAwesomeIcon icon={faPhone} /> { }
                            </a>
                            <a href="#" className="icon">
                                <FontAwesomeIcon icon={faGooglePlusG} /> { }
                            </a>
                        </div>
                        <input type={loginWithEmail ? 'email' : 'tel'} placeholder={loginWithEmail ? 'Email' : 'Phone Number'} /> {/* Promijenjen placeholder */}
                        <input type="password" placeholder="Password" />
                        <a href="#">Forget Your Password?</a>
                        <button>Sign In</button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all site features</p>
                            <button className="hidden" id="login">Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello there!</h1>
                            <p>Register with your personal details to use all site features</p>
                            <button className="hidden" id="register">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;