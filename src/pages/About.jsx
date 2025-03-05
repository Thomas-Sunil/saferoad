import React from "react";
import Aboutbar from "../components/Aboutbar";

const About = () => {
  return (
    <div style={styles.container}>
      <Aboutbar />
      <div style={styles.content}>
        <h1>About SafeRoad AI</h1>
        <p>
          SafeRoad AI is a machine learning-based system designed to predict
          accident-prone areas using real-time data and AI models.
        </p>
      </div>
    </div>
  );
};

// Inline styles for responsiveness
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  content: {
    maxWidth: "600px",
    width: "90%",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
};

export default About;
