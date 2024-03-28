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
    if(localStorage.getItem("username") != null && localStorage.getItem("accessToken") != null)
      navigate('/homePage', { state:
          { "username": localStorage.getItem("username"),
            "refreshToken": localStorage.getItem("refreshToken"),
            "accessToken": localStorage.getItem("accessToken")} })

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

  async function loginLogic(event){
    event.preventDefault();
    const name = document.getElementById(loginWithEmail ? "email" : "tel").value;
    const pass = document.getElementById("password").value;

    try {
      const response = await fetch('https://feedtrack-backend.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"email": name, "password": pass})
      });

      if (response.ok) {
        // Handle successful login
        console.log('Login successful');
        let responseData = await response.json()
        localStorage.setItem('refreshToken', responseData.refreshToken);
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('username', responseData.username);

        navigate('/homePage', { state: { "username": responseData.username, "refreshToken": responseData.refreshToken, "accessToken": responseData.accessToken } });

      } else {
        // Handle login error
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

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
          <form onSubmit={loginLogic}>
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
              type={loginWithEmail ? "email" : "tel"}
              id={loginWithEmail ? "email" : "tel"}
              placeholder={loginWithEmail ? "Email" : "Phone Number"}
            />{" "}
            {/* Promijenjen placeholder */}
            <input type="password" id="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <input type="submit" value="Sign In"/>
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
