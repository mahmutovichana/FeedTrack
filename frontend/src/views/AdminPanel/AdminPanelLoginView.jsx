import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import "../../styles/AdminPanel/AdminPanelLoginView.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const YOUR_CLIENT_ID = "613438595302-q36ubvr0othatg6lcpmrm7t52vu6jqkq.apps.googleusercontent.com";
const YOUR_REDIRECT_URI = "https://feedtrack.vercel.app/";

const Login = () => {

  const [loginWithEmail, setLoginWithEmail] = useState(true);

  const navigate = useNavigate();

  async function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    if (response.credential) {
      try {
        const decodedToken = jwtDecode(response.credential);
        console.log(decodedToken);
        const userData = {
          name: decodedToken.given_name,
          lastName: decodedToken.family_name,
          email: decodedToken.email,
          image: decodedToken.picture,
          username: "defaultUsername",
          password: "defaultPassword",
          mobileNumber: "123456789",
          role: "defaultRole",
          jti: decodedToken.jti
        };

        localStorage.email = userData.email;

        // Fetch maximum ID from the database
        const maxIdResponse = await fetch('http://localhost:3000/api/getMaxUserId');
        const maxIdData = await maxIdResponse.json();
        const nextId = maxIdData.maxId + 1;
        userData.id = nextId;

        console.log(JSON.stringify(userData));

        // Check if user exists in the database
        const existingUserResponse = await fetch('http://localhost:3000/api/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        if (existingUserResponse.ok) {
          const existingUserResult = await existingUserResponse.json();
          if (existingUserResult.message === "User already exists") {
            console.log('User already exists');
          } else {
            console.log('User added successfully');
          }
        } else if (existingUserResponse.status === 400) {
          const errorData = await existingUserResponse.json();
          console.error('Error adding user:', errorData.message);
        } else {
          console.error('Error adding user:', existingUserResponse.statusText);
        }

        navigate('/homePage', { state: { "username": localStorage.getItem("email"), "refreshToken": localStorage.getItem("refreshToken") } });

        console.log("Redirection completed successfully.");
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    } else {
      console.log('Google login failed');
    }
  }

  useEffect(() => {
    // Ensuring that google is defined before using it
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: YOUR_CLIENT_ID,
        callback: handleCallbackResponse
      });
    } else {
      console.log('Google Identity Services library not loaded.');
    }

    if (localStorage.getItem("username") != null && localStorage.getItem("refreshToken") != null)
      navigate('/homePage', {
        state:
        {
          "username": localStorage.getItem("username"),
          "refreshToken": localStorage.getItem("refreshToken"),
          "accessToken": localStorage.getItem("accessToken")
        }
      })

    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    const handleRegisterClick = () => {
      container.classList.add("active");
    };

    const handleLoginClick = () => {
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
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      console.log("Google SDK is not fully loaded.");
    }
  };

  const [error, setError] = useState("");

  async function loginLogic(event) {
    
    event.preventDefault();

    const inputType = loginWithEmail ? "email" : "number";
    const name = document.getElementById(inputType).value;
    const pass = document.getElementById("password").value;

    // Error message reset
    setError("");

    // Validation
    if (!name || !pass) {
      setError(!name ? "Email or phone number is required!" : "Password is required!");
      return;
    }

    try {
      const requestBody = {};
      requestBody["email"] = inputType=="email" ? name : " ";
      requestBody["password"] = pass;
      requestBody["number"] = inputType=="email" ? " " : name;

      console.log(JSON.stringify(requestBody));
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
/*
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "email": name, "password": pass })
      });*/

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
                <a href="#" className="icon" onClick={handleGoogleSignIn}>
                  <FontAwesomeIcon icon={faGoogle} />
                </a>
              </div>
              <span>
                or use your {loginWithEmail ? "email" : "phone number"} for
                registration
              </span>
              <input type="text" placeholder="Name" />
              <input
                type={loginWithEmail ? "email" : "mobileNumberSU"}
                id={loginWithEmail ? "emailSU" : "mobileNumberSU"}
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
                type={loginWithEmail ? "email" : "number"}
                id={loginWithEmail ? "email" : "number"}
                placeholder={loginWithEmail ? "Email" : "Phone Number"}
              />{" "}
              <input type="password" id="password" placeholder="Password" />
              <a href="#">Forgot Your Password?</a>
              <button>Sign In</button>
              {error && <p>{error}</p>}
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
