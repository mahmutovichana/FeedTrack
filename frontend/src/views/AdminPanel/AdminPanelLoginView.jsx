import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import "../../styles/AdminPanel/AdminPanelLoginView.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const YOUR_CLIENT_ID = "613438595302-q36ubvr0othatg6lcpmrm7t52vu6jqkq.apps.googleusercontent.com";

const Login = () => {

  const [loginWithEmail, setLoginWithEmail] = useState(true);

  const navigate = useNavigate();

  async function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    if (response.credential) {
      try {
        const decodedToken = jwtDecode(response.credential);
        console.log(decodedToken);

        localStorage.jti = decodedToken.jti;
        localStorage.image = decodedToken.picture;

        // Fetch maximum ID from the database
        const maxIdResponse = await fetch('https://feedtrack-backend.vercel.app/api/getMaxUserId');
        const maxIdData = await maxIdResponse.json();
        const nextId = maxIdData.maxId + 1;

        const userData = {
          id: nextId,
          name: decodedToken.given_name,
          lastName: decodedToken.family_name,
          email: decodedToken.email,
          username: "defaultUsername",
          password: "defaultPassword",
          mobileNumber: "123456789",
          role: "defaultRole"
        };

        localStorage.user = userData;
        console.log(JSON.stringify(userData));

        // Check if user exists in the database
        const existingUserResponse = await fetch('https://feedtrack-backend.vercel.app/api/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        let existingUserResult = " ", errorData = " ";
        if (existingUserResponse.ok) {
          existingUserResult = await existingUserResponse.json();
          if (existingUserResult.message === "User already exists") {
            console.log('User already exists');
          } else {
            console.log('User added successfully');
          }
        } else if (existingUserResponse.status === 400) {
          errorData = await existingUserResponse.json();
          console.error('Error adding user:', errorData.message);
        } else {
          console.error('Error adding user:', existingUserResponse.statusText);
        }

        localStorage.token = existingUserResult.token || errorData.token;
        navigate('/homePage', { state: { "username": localStorage.getItem("email"), "token": localStorage.getItem("token") } });

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
      requestBody["email"] = inputType == "email" ? name : " ";
      requestBody["password"] = pass;
      requestBody["number"] = inputType == "email" ? " " : name;

      console.log(JSON.stringify(requestBody));
      const response = await fetch('https://feedtrack-backend.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      let responseData;
      if (response.ok) {
        // Handle successful login
        console.log('Login successful');
        responseData = await response.json()
      //navigate('/homePage', { state: { "username": responseData.username, "token": responseData.token, "secret": responseData.secret}});
      } else {
        // Handle login error
        console.error('Login failed');
      }

      console.log(JSON.stringify(responseData));
      const dataSecret = responseData.secret;
      // Postavljanje secret-a u localStorage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('username', responseData.username);
      localStorage.setItem('secretURL', responseData.secret.otpauth_url);
      localStorage.setItem('secret', responseData.secret);
      console.log("localStorage.getItem('secret'): "+JSON.stringify(localStorage.getItem('secret')));
      // Pozivanje twofactorsetup rute
      const twofactorResponse = await fetch('https://feedtrack-backend.vercel.app/api/twofactorsetup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: localStorage.secretURL
        })
      });

      if (twofactorResponse.ok) {
        const twofactorData = await twofactorResponse.json();
        console.log("2fa response je: "+twofactorData);
        const { dataUrl } = twofactorData;
        Object.entries(dataSecret).forEach(([ključ, vrijednost]) => {
          console.log(`${ključ}: ${vrijednost}`);
        });
        console.log("ovo je sta se salje: "+dataSecret);
        // Process the data URL (e.g., render QR code)
        processQRCode(dataUrl, dataSecret);
      } else {
        console.error('Failed to retrieve twofactorsetup data');
      }

    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  const processQRCode = (dataUrl, secret) => {
    const template = `
      <h1>Setup Authenticator</h1>
      <h3>Use the QR code with your authenticator app</h3>
      <img src="${dataUrl}" > <br>
      <input type="text" id="tokenInput" placeholder="Enter token">
      <button id="verifyButton">Verify</button>
    `;

    const QRcontainer = document.getElementById('qrCodeContainer');
    const container = document.getElementById('container');
    QRcontainer.hidden = false;
    container.hidden = true;
    QRcontainer.innerHTML = template;

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
            navigate('/homePage', { state: { "username": localStorage.getItem("email"), "token": localStorage.getItem("token") } });
            // window.location.href = 'https://feedtrack.vercel.app/homePage';
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
      <div id="qrCodeContainer" hidden></div>
    </div>
  );
};

export default Login;
