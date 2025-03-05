import React from "react";
import { Link } from "react-router-dom";

const Aboutbar = () => {
  return (
    <nav style={styles.navbar}>
      <h1 style={styles.logo}>SafeRoad AI</h1>
      <div>
        <Link to="/" style={styles.button}>Home</Link>
      </div>
    </nav>
  );
};

// Updated styles to remove margins and ensure the navbar sticks to the top
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    width: "100%",
    position: "fixed",
    top: "0",
    left: "0",
    height: "60px",
    boxSizing: "border-box",
    zIndex: "1000",
  },
  logo: {
    margin: 0,
    fontSize: "24px",
  },
  button: {
    textDecoration: "none",
    color: "white",
    fontSize: "18px",
    backgroundColor: "#0056b3",
    padding: "8px 12px",
    borderRadius: "5px",
  },
};

export default Aboutbar;
