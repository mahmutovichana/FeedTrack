import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import feedtrackLogo from "./../../assets/feedtrackLogoBlack.svg";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../styles/AdminPanel/AdminLogin.scss";
import { deployURLs } from "../../../public/constants";

const GOOGLE_CLIENT_ID = "613438595302-q36ubvr0othatg6lcpmrm7t52vu6jqkq.apps.googleusercontent.com";

const Login = () => {

  const [loginWithEmail, setLoginWithEmail] = useState(true);

  const navigate = useNavigate();

  /** 
 * Handles the response after the user signs in via Google. 
 * Decodes the JWT token, sends requests to the backend to verify and add the user to the database, 
 * and saves user data in local storage. Prints appropriate error messages if there are any errors
 */
  async function handleCallbackResponse(response) {
    if (response.credential) {
      try {
        const decodedToken = jwtDecode(response.credential);
        console.log(decodedToken);
        localStorage.jti = decodedToken.jti;
        localStorage.image = decodedToken.picture;

        // Fetch maximum ID from the database
        const maxIdResponse = await fetch(`${deployURLs.backendURL}/api/getMaxUserId`);
        const maxIdData = await maxIdResponse.json();
        const nextId = maxIdData.maxId + 1;

        const userData = {
          id: nextId,
          name: decodedToken.given_name,
          lastname: decodedToken.family_name,
          email: decodedToken.email,
          image: decodedToken.picture,
          verified: true
        };

        localStorage.setItem('user', JSON.stringify(userData));
        console.log(localStorage.user);

        // Check if user exists in the database
        const existingUserResponse = await fetch(`${deployURLs.backendURL}/api/googleAddUser`, {
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': true,
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

        localStorage.user = existingUserResult.user || errorData.user;
        localStorage.token = existingUserResult.token || errorData.token;
        console.log("User in local storage: " + localStorage.user);
        navigate('/home', { state: { "user": localStorage.user, "token": localStorage.token } });

        console.log("Redirection completed successfully.");
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    } else {
      console.log('Google login failed');
    }
  }

  /* Initializes the Google SDK and sets event listeners for clicks on the "About Us" and "Sign In" buttons. 
  * Also removes event listeners when the component unmounts. 
  */
  useEffect(() => {
    // Ensuring that google is defined before using it
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCallbackResponse
      });
    } else console.log('Google Identity Services library not loaded.');

    /*
        if (localStorage.getItem("user") != null && localStorage.getItem("token") != null)
          navigate('/home', {
            state:
            {
              "user": localStorage.user,
              "token": localStorage.getItem("token")
            }
          })*/

    const container = document.getElementById("container");
    const aboutUsBtn = document.getElementById("aboutUs");
    const loginBtn = document.getElementById("login");

    if (container && aboutUsBtn && loginBtn) {
      const handleAboutUsClick = () => {
        container.classList.add("active");
      };

      const handleLoginClick = () => {
        container.classList.remove("active");
      };

      aboutUsBtn.addEventListener("click", handleAboutUsClick);
      loginBtn.addEventListener("click", handleLoginClick);

      // Cleanup event listeners when component unmounts
      return () => {
        aboutUsBtn.removeEventListener("click", handleAboutUsClick);
        loginBtn.removeEventListener("click", handleLoginClick);
      };
    }

    // Cleanup event listeners when component unmounts
    return () => {
      aboutUsBtn.removeEventListener("click", handleAboutUsClick);
      loginBtn.removeEventListener("click", handleLoginClick);
    };
  }, []);

  /* Toggles between email and phone number login form states.*/
  const handleToggle = () => {
    setLoginWithEmail((prevState) => !prevState);
  };

  /* Initiates the Google sign-in process if the Google SDK is loaded */
  const handleGoogleSignIn = () => {
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      console.log("Google SDK is not fully loaded.");
    }
  };

  const [error, setError] = useState("");

  /*
  * Validates user input (email/phone and password), sends an authentication request to the backend. 
  * If login is successful, saves user data and tokens in local storage. 
  * If the user is verified, redirects to the home page. 
  * Also handles 2FA setup if enabled, displaying a QR code for authentication.
  */
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
      const response = await fetch(`${deployURLs.backendURL}/api/login`, {
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
      } else {
        // Handle login error
        const errorResponseData = await response.json();
        setError(errorResponseData.message);
      }

      console.log(JSON.stringify(responseData));
      const dataSecret = responseData.secret;
      // setting the token, user and secret in localStorage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData));
      localStorage.setItem('secretURL', responseData.secret.otpauth_url);
      localStorage.setItem('secret', responseData.secret);
      console.log("localStorage.getItem('secret'): " + JSON.stringify(localStorage.getItem('secret')));
      localStorage.setItem('verified', responseData.verified);
      localStorage.setItem('id', responseData.id);
      if (responseData.verified === true) {
        navigate('/home', { state: { "user": localStorage.user, "token": localStorage.token, "id": localStorage.id } });
      }
      // setuping up the 2fa for the non-verified users
      const twofactorResponse = await fetch(`${deployURLs.backendURL}/api/2faSetup`, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: localStorage.secretURL
        })
      });

      if (twofactorResponse.ok) {
        const twofactorData = await twofactorResponse.json();
        console.log("2fa response: " + twofactorData);
        const { dataUrl } = twofactorData;
        Object.entries(dataSecret).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
        console.log("this is the data secret: " + dataSecret);
        // Process the data URL (e.g., render QR code)
        processQRCode(dataUrl, dataSecret);
      } else {
        navigate('/');
        console.error('Failed to retrieve 2FA setup data');
      }

    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  /* Processes the QR code displayed after successful login for 2FA activation. 
  * After the user enters the token and clicks verify, 
  * sends a request to the backend to verify the token. 
  */
  const processQRCode = (dataUrl, secret) => {
    const template = `
        <h1>Setup Authenticator</h1>
        <h3>Use the QR code with your authenticator app</h3>
        <img src="${dataUrl}" > <br>
        <div class="tokenInputs">
        ${Array.from({ length: 6 }, (_, index) => `
          <input type="text" maxlength="1" size="1" class="tokenInput" autocomplete="off">
        `).join('')}
        </div>
        <button id="verifyButton">Verify</button>
        <label id="errorLabel" style="color: red;"></label> <!-- Error label -->
      `;

    const QRcontainer = document.getElementById('qrCodeContainer');
    const container = document.getElementById('container');
    QRcontainer.hidden = false;
    container.hidden = true;
    QRcontainer.innerHTML = template;

    const tokenInputs = document.querySelectorAll('.tokenInput');

    // Define function to focus on next input field
    const focusNextInput = (index) => {
      if (index < tokenInputs.length - 1) {
        tokenInputs[index + 1].focus();
      }
    };

    // Attach event listeners to each input field
    tokenInputs.forEach((input, index) => {
      input.addEventListener('input', (event) => {
        const inputLength = event.target.value.length;
        if (inputLength === 1) {
          focusNextInput(index);
        }
      });
    });

    // Define verifyToken globally
    window.verifyToken = (secret) => {
      const token = Array.from(tokenInputs).map(input => input.value).join('');
      fetch(`${deployURLs.backendURL}/api/verify`, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': true,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userToken: token, secret: secret }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const user_id = localStorage.getItem("id");
            //ubaciti promjenu verified u true;
            fetch(`${deployURLs.backendURL}/api/users/${user_id}`, {
              method: 'PUT',
              headers: {
                'Access-Control-Allow-Origin': true,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ "verified": true }),
            })
            navigate('/home', { state: { "user": localStorage.getItem("user"), "token": localStorage.getItem("token") } });
          } else {
            // Display error message
            const errorLabel = document.getElementById('errorLabel');
            if (errorLabel) {
              errorLabel.textContent = "Incorrect code";
            } else {
              console.error('Error label element not found');
            }
          }
        })
        .catch(error => {
          console.error('Error verifying token:', error);
        });
    };

    // Attach event listener to the Verify button
    verifyButton.addEventListener('click', () => {
      verifyToken(secret);
    });

  };

  return (
    <div className="loginLayout">
      <div className="logo">
        <img src={feedtrackLogo} className="logo" alt="FeedTrack logo" />
      </div>
      <div className="container" id="container">
        <div className="form-container sign-up">
          <form>
            <h1>About Us 🚀</h1>
            <p style={{ textAlign: 'justify' }}>
              FeedTrack is a platform utilized in bank branches to collect feedback from customers after service transactions.
              This feedback helps administrators to analyze and improve customer experience.
              Additionally, FeedTrack enables running various campaigns to gather diverse responses and insights for further enhancements.
            </p>
            <p style={{ textAlign: 'justify' }}>
              Join us on our journey to revolutionize customer feedback in banking! 💼📊
            </p>
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
                Curious to learn more about us? Let's dive in and discover what makes us unique! 💡🔍
              </p>
              <button className="hidden" id="aboutUs">
                About Us
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