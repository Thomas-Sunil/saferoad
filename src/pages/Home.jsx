import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

const Home = () => {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [autocompleteStart, setAutocompleteStart] = useState(null);
  const [autocompleteEnd, setAutocompleteEnd] = useState(null);

  const handleFindRoute = () => {
    if (!startPoint || !endPoint) {
      alert("Please enter both start and end points.");
      return;
    }
    navigate(`/route?start=${encodeURIComponent(startPoint)}&end=${encodeURIComponent(endPoint)}`);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h1>SafeRoad AI</h1>
        <p>Find accident-prone areas and ensure safe travel routes.</p>

        <div style={styles.formContainer}>
          <label style={styles.label}>Start Point</label>
          {isLoaded ? (
            <Autocomplete
              onLoad={(autocomplete) => setAutocompleteStart(autocomplete)}
              onPlaceChanged={() => setStartPoint(autocompleteStart?.getPlace()?.formatted_address || "")}
            >
              <input type="text" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} placeholder="Enter start location" style={styles.input} />
            </Autocomplete>
          ) : (
            <input type="text" placeholder="Loading maps..." style={styles.input} disabled />
          )}

          <label style={styles.label}>End Point</label>
          {isLoaded ? (
            <Autocomplete
              onLoad={(autocomplete) => setAutocompleteEnd(autocomplete)}
              onPlaceChanged={() => setEndPoint(autocompleteEnd?.getPlace()?.formatted_address || "")}
            >
              <input type="text" value={endPoint} onChange={(e) => setEndPoint(e.target.value)} placeholder="Enter destination" style={styles.input} />
            </Autocomplete>
          ) : (
            <input type="text" placeholder="Loading maps..." style={styles.input} disabled />
          )}

          <button style={styles.findRouteButton} onClick={handleFindRoute}>
            Find Route
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: { textAlign: "center", paddingTop: "70px" },
  content: { maxWidth: "600px", margin: "auto", padding: "50px 50px", backgroundColor: "#f8f9fa" },
  formContainer: { display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" },
  label: { fontWeight: "bold" },
  input: { width: "100%", padding: "10px", fontSize: "16px" },
  findRouteButton: { padding: "10px", fontSize: "16px", backgroundColor: "#28a745", color: "white", cursor: "pointer", marginTop: "10px",width:"625px"},
};

export default Home;
