import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authCofig";
import axios from "axios";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();

  // test user name came here
  const handleEmailClick = () => {
    setLoading(true);
    instance
      .loginPopup(loginRequest)
      .then((response) => {
        const email = response.account.username;

        axios
          .post(
            "http://localhost:8080/api/auth/internal",
            { email },
            { withCredentials: true }
          )
          .then((res) => {
            const { name, email } = res.data;
            // console.log("Username (email):", name);
            if (name) {
              localStorage.setItem("userName", name);

              localStorage.setItem("userEmail", email);
              navigate("/my-approvals");
            } else {
              setErrorMessage("Access Denied");
            }
          })
          .catch(() => {
            setErrorMessage("Something went wrong");
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div style={styles.container}>
      <img src="/logo1.png" alt="Logo" style={styles.logo} />

      <div style={styles.card}>
        <h2 style={styles.title}>Welcome !</h2>
        <p style={styles.subtitle}>Please sign in to continue</p>

        <form>
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}
          <button
            type="button"
            style={styles.signInButton}
            onClick={handleEmailClick}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In with Microsoft"}
          </button>
        </form>

        <p style={styles.signupText}>
          Don’t have an account?{" "}
          <a href="#" style={styles.signupLink}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('/image3.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backdropFilter: "blur(5px)",
    position: "relative",
  },
  card: {
    background: "rgba(255, 255, 255, 0.85)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    width: "100%",
    maxWidth: "420px",
    zIndex: 1,
  },
  logo: {
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "100px",
    height: "auto",
    objectFit: "contain",
  },
  title: {
    color: "#333",
    fontSize: "30px",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginBottom: "30px",
    fontSize: "16px",
  },
  label: {
    display: "block",
    textAlign: "left",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease-in-out",
  },
  forgotPassword: {
    display: "block",
    color: "#0078d4",
    textDecoration: "none",
    marginBottom: "20px",
    fontSize: "14px",
    cursor: "pointer",
  },
  signInButton: {
    background: "linear-gradient(45deg, #0078d4, #00c6ff)",
    color: "white",
    border: "none",
    padding: "14px",
    width: "100%",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  signupText: {
    marginTop: "25px",
    fontSize: "14px",
    color: "#333",
  },
  signupLink: {
    color: "#0078d4",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "-10px",
    marginBottom: "10px",
    textAlign: "left",
  },
};

export default SignIn;
