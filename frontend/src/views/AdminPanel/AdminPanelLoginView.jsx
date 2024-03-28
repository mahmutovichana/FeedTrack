import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import "../../styles/AdminPanel/AdminPanelLoginView.css";
import {Link, useNavigate} from "react-router-dom";

const YOUR_CLIENT_ID =
  "613438595302-q36ubvr0othatg6lcpmrm7t52vu6jqkq.apps.googleusercontent.com";
const YOUR_REDIRECT_URI = "https://feedtrack.vercel.app/";

const Login = () => {
  const [loginWithEmail, setLoginWithEmail] = useState(true);

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
  }

  useEffect(() => {
    // global google
    /*
        google.accounts.id.initialize({
            client_id: YOUR_CLIENT_ID,
            callback: handleCallbackResponse
        });
        */
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    const handleRegisterClick = () => {
      container.classList.add("active");
    };

    const handleLoginClick = () =>{
      container.classList.remove("active");
    };

    registerBtn.addEventListener("click", handleRegisterClick);
    loginBtn.addEventListener("click", handleLoginClick);

    // Cleanup event listeners when component unmounts
    return () => {
      registerBtn.removeEventListener("click", handleRegisterClick);
      loginBtn.removeEventListener("click", handleLoginClick);
    };
  }, []);

  const handleToggle = () => {
    setLoginWithEmail((prevState) => !prevState);
  };

  const handleGoogleSignIn = () => {
    /*
        if (google && google.accounts && google.accounts.id) {
            google.accounts.id.prompt();
        } else {
            console.error("Google SDK is not fully loaded.");
        }
        */
  };

  const handleGoogleSignUp = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${YOUR_CLIENT_ID}&redirect_uri=${YOUR_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline`;
  };

  const handleSignIn = async () => {
    console.log('User signed in');
    const emailOrPhone = document.getElementById('emailOrPhoneInput').value.trim();
    const password = document.getElementById('password').value.trim();
    if (loginWithEmail) {
      // User entered an email
      console.log('Email entered:', emailOrPhone);
      console.log('password:', password);
      try {
        const response = await fetch('https://feedtrack-backend.vercel.app/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: emailOrPhone,
            password: password
          })
        });
        
        if (response.ok) {
          console.log('User authenticated successfully');
          
          const userData = await response.json();
          const { username, refreshToken, accessToken, secret } = userData;
          localStorage.setItem('username', username);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('accessToken', accessToken);
          
          // Call twofactorsetup route
          const twofactorResponse = await fetch('https://feedtrack-backend.vercel.app/api/twofactorsetup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              secret: secret
            })
          });
  
          if (twofactorResponse.ok) {
            const twofactorData = await twofactorResponse.json();
            const { dataUrl } = twofactorData;
            
            // Process the data URL (e.g., render QR code)
            processQRCode(dataUrl, secret);
          } else {
            console.error('Failed to retrieve twofactorsetup data');
          }
        } else {
          console.error('Authentication failed');
          window.location.href = '/';
          document.getElementById('emailOrPhoneInput').value = '';
          document.getElementById('password').value = '';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      // User entered a phone number
      console.log('Phone number entered:', emailOrPhone);
      console.log('password:', password);
    }
  };

  const processQRCode = (dataUrl, secret) => {
    const template = `
      <h1>Setup Authenticator</h1>
      <h3>Use the QR code with your authenticator app</h3>
      <img src="${dataUrl}" > <br>
      <input type="text" id="tokenInput" placeholder="Enter token">
      <button id="verifyButton">Verify</button>
    `;
    
    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = template;
  
    // Define verifyToken globally
    window.verifyToken = (secret) => {
      const token = document.getElementById('tokenInput').value;
      fetch('https://feedtrack-backend.vercel.app/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userToken: token, secret: secret }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const username = localStorage.getItem('username');
          const refreshToken = localStorage.getItem('refreshToken');
          const accessToken = localStorage.getItem('accessToken');
          navigate('/homePage', { state: { username, refreshToken, accessToken } });
        } else {
          document.getElementById('tokenInput').value = "Incorrect code";
        }
      })
      .catch(error => {
        console.error('Error verifying token:', error);
      });
    };
  
    // Attach event listener to the Verify button
    const verifyButton = document.getElementById('verifyButton');
    verifyButton.addEventListener('click', () => {
      verifyToken(secret);
    });
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
              <a
                href="#"
                className={`icon ${loginWithEmail ? "active" : ""}`}
                onClick={() => setLoginWithEmail(true)}
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
              <a
                href="#"
                className={`icon ${!loginWithEmail ? "active" : ""}`}
                onClick={() => setLoginWithEmail(false)}
              >
                <FontAwesomeIcon icon={faPhone} />
              </a>
              <a href="#" className="icon" onClick={handleGoogleSignUp}>
                <FontAwesomeIcon icon={faGoogle} />
              </a>
            </div>
            <span>
              or use your {loginWithEmail ? "email" : "phone number"} for
              registration
            </span>
            <input type="text" placeholder="Name" />
            <input
              type={loginWithEmail ? "email" : "tel"}
              id={loginWithEmail ? "emailSU" : "telSU"}
              placeholder={loginWithEmail ? "Email" : "Phone Number"}
            />
            <input type="password" id="passwordSU" placeholder="Password" />
            <button>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form>
            <h1>Sign In</h1>
            <div className="options">
              <a
                href="#"
                className={`icon ${loginWithEmail ? "active" : ""}`}
                onClick={() => setLoginWithEmail(true)}
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
              <a
                href="#"
                className={`icon ${!loginWithEmail ? "active" : ""}`}
                onClick={() => setLoginWithEmail(false)}
              >
                <FontAwesomeIcon icon={faPhone} />
              </a>
              <a href="#" className="icon" onClick={handleGoogleSignIn}>
                <FontAwesomeIcon icon={faGoogle} />
              </a>
            </div>
            <input
              id="emailOrPhoneInput"
              type={loginWithEmail ? "email" : "tel"}
             // id={loginWithEmail ? "email" : "tel"}
              placeholder={loginWithEmail ? "Email" : "Phone Number"}
            />{" "}
            {/* Promijenjen placeholder */}

            <input id="password" type="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <Link to="/authentication" onClick={handleSignIn}>Sign In</Link>

          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all site features</p>
              <button className="hidden" id="login">
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello there!</h1>
              <p>
                Register with your personal details to use all site features
              </p>
              <button className="hidden" id="register">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
