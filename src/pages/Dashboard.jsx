import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

const Dashboard = () => {
  // State for form inputs
  const [type, setType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");

  // Function to validate latitude & longitude
  const isValidCoordinate = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -90 && num <= 90;
  };

  // Function to add data to Firestore
  const handleAddSign = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in to add a road marking!");
        return;
      }

      if (!type || !latitude || !longitude) {
        setMessage("All fields are required!");
        return;
      }

      if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
        setMessage("Please enter valid latitude & longitude values!");
        return;
      }

      await addDoc(collection(db, "road_markings"), {
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        addedBy: user.uid,
        timestamp: Timestamp.now(),
      });

      setMessage("Road sign added successfully!");
      setType("");
      setLatitude("");
      setLongitude("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>

      {message && <p style={styles.message}>{message}</p>}

      <label>Type of Road Sign:</label>
      <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
        <option value="">Select a sign</option>

        <optgroup label="Regulatory Signs">
          <option value="Stop">Stop</option>
          <option value="Give Way">Give Way</option>
          <option value="No Entry">No Entry</option>
          <option value="No Parking">No Parking</option>
          <option value="Speed Limit 40">Speed Limit 40</option>
          <option value="Speed Limit 60">Speed Limit 60</option>
          <option value="No Overtaking">No Overtaking</option>
          <option value="No U-Turn">No U-Turn</option>
          <option value="Horn Prohibited">Horn Prohibited</option>
        </optgroup>

        <optgroup label="Cautionary Signs (Warnings)">
          <option value="Crossroad">Crossroad</option>
          <option value="Pedestrian Crossing">Pedestrian Crossing</option>
          <option value="School Ahead">School Ahead</option>
          <option value="Speed Breaker">Speed Breaker</option>
          <option value="Narrow Road">Narrow Road</option>
          <option value="Slippery Road">Slippery Road</option>
          <option value="Steep Ascent">Steep Ascent</option>
          <option value="Steep Descent">Steep Descent</option>
          <option value="Men at Work">Men at Work</option>
        </optgroup>

        <optgroup label="Informatory Signs (Guidance)">
          <option value="Parking">Parking</option>
          <option value="Hospital">Hospital</option>
          <option value="Petrol Pump">Petrol Pump</option>
          <option value="Bus Stop">Bus Stop</option>
          <option value="Direction Sign">Direction Sign</option>
          <option value="One Way">One Way</option>
        </optgroup>
      </select>

      <label>Latitude:</label>
      <input
        type="text"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        placeholder="Enter latitude"
        style={styles.input}
      />

      <label>Longitude:</label>
      <input
        type="text"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        placeholder="Enter longitude"
        style={styles.input}
      />

      <button onClick={handleAddSign} style={styles.button}>Add Road Marking</button>
    </div>
  );
};

// Simple CSS styles
const styles = {
  container: { maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" },
  input: { width: "100%", padding: "8px", margin: "8px 0", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", background: "blue", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
  message: { color: "green", fontWeight: "bold" },
};

export default Dashboard;
