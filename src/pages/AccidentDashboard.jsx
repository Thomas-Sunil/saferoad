import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// Regions & Police Stations Data
const policeStationsByRegion = {
  "Thiruvananthapuram": ["Trivandrum City Police", "Kovalam Police", "Neyyattinkara Police"],
  "Kochi": ["Kochi City Police", "Ernakulam Rural Police"],
  "Kozhikode": ["Kozhikode City Police", "Vadakara Police"],
  "Thrissur": ["Thrissur City Police", "Guruvayur Police"],
  "Kannur": ["Kannur Police", "Taliparamba Police"],
};

const vehicleTypes = ["Car", "Bike", "Bus", "Truck", "Auto Rickshaw", "Cycle", "Other"];

const AccidentDashboard = () => {
  const [region, setRegion] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [beforeLatitude, setBeforeLatitude] = useState("");
  const [beforeLongitude, setBeforeLongitude] = useState("");
  const [afterLatitude, setAfterLatitude] = useState("");
  const [afterLongitude, setAfterLongitude] = useState("");
  const [accidentLatitude, setAccidentLatitude] = useState("");
  const [accidentLongitude, setAccidentLongitude] = useState("");
  const [accidentCause, setAccidentCause] = useState("");
  const [injurySeverity, setInjurySeverity] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  const [numVehicles, setNumVehicles] = useState(1);
  const [vehicles, setVehicles] = useState([{ number: "", type: "" }]);
  const [message, setMessage] = useState("");

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index][field] = value;
    setVehicles(updatedVehicles);
  };

  const updateVehicleInputs = (num) => {
    const newVehicles = Array.from({ length: num }, (_, i) => 
      vehicles[i] || { number: "", type: "" }
    );
    setVehicles(newVehicles);
  };

  const handleAddAccident = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in to report an accident!");
        return;
      }

      if (
        !beforeLatitude || !beforeLongitude || 
        !afterLatitude || !afterLongitude || !accidentLatitude ||
        !accidentLongitude|| !accidentCause || !region || !policeStation || !injurySeverity || !accidentDate ||
        vehicles.some(v => !v.number || !v.type)
      ) {
        setMessage("All fields are required!");
        return;
      }

      await addDoc(collection(db, "accident_history"), {
        beforeLatitude: parseFloat(beforeLatitude),
        beforeLongitude: parseFloat(beforeLongitude),
        afterLatitude: parseFloat(afterLatitude),
        afterLongitude: parseFloat(afterLongitude),
        accidentLattitude: parseFloat(accidentLatitude),
        accidentLongitude: parseFloat(accidentLongitude),
        accidentCause,
        region,
        policeStation,
        injurySeverity,
        accidentDate: Timestamp.fromDate(new Date(accidentDate)), 
        vehicles,
        reportedBy: user.uid,
        timestamp: Timestamp.now(),
      });

      setMessage("Accident history added successfully!");
      setRegion("");
      setPoliceStation("");
      setBeforeLatitude("");
      setBeforeLongitude("");
      setAfterLatitude("");
      setAfterLongitude("");
      setAccidentLongitude("");
      setAccidentLatitude("");
      setAccidentCause("");
      setInjurySeverity("");
      setAccidentDate("");
      setNumVehicles(1);
      setVehicles([{ number: "", type: "" }]);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Accident History Dashboard</h2>

      {message && <p style={styles.message}>{message}</p>}

      <label>Region:</label>
      <select value={region} onChange={(e) => {
        setRegion(e.target.value);
        setPoliceStation(""); // Reset police station when region changes
      }} style={styles.input}>
        <option value="">Select Region</option>
        {Object.keys(policeStationsByRegion).map((regionName, index) => (
          <option key={index} value={regionName}>{regionName}</option>
        ))}
      </select>

      <label>Police Station:</label>
      <select value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} style={styles.input} disabled={!region}>
        <option value="">Select Police Station</option>
        {region && policeStationsByRegion[region].map((station, index) => (
          <option key={index} value={station}>{station}</option>
        ))}
      </select>

      <label>Before Accident Latitude:</label>
      <input type="text" value={beforeLatitude} onChange={(e) => setBeforeLatitude(e.target.value)} style={styles.input} />

      <label>Before Accident Longitude:</label>
      <input type="text" value={beforeLongitude} onChange={(e) => setBeforeLongitude(e.target.value)} style={styles.input} />

      <label>After Accident Latitude:</label>
      <input type="text" value={afterLatitude} onChange={(e) => setAfterLatitude(e.target.value)} style={styles.input} />

      <label>After Accident Longitude:</label>
      <input type="text" value={afterLongitude} onChange={(e) => setAfterLongitude(e.target.value)} style={styles.input} />

      <label>Accident Latitude:</label>
      <input type="text" value={accidentLatitude} onChange={(e) => setAccidentLatitude(e.target.value)} style={styles.input} />
      <label>Accident Longitude:</label>
      <input type="text" value={accidentLongitude} onChange={(e) => setAccidentLongitude(e.target.value)} style={styles.input} />

      <label>Cause of Accident:</label>
      <select value={accidentCause} onChange={(e) => setAccidentCause(e.target.value)} style={styles.input}>
        <option value="">Select cause</option>
        <option value="Careless Driving">Careless Driving</option>
        <option value="Road Features">Road Features</option>
        <option value="Vehicle Crash">Vehicle Crash</option>
        <option value="Over Speeding">Over Speeding</option>
        <option value="Drunk Driving">Drunk Driving</option>
        <option value="Poor Weather">Poor Weather</option>
      </select>

      <label>Injury Severity:</label>
      <select value={injurySeverity} onChange={(e) => setInjurySeverity(e.target.value)} style={styles.input}>
        <option value="">Select severity</option>
        <option value="Minor">Minor</option>
        <option value="Severe">Severe</option>
        <option value="Grievous">Grievous</option>
        <option value="Fatal">Fatal</option>
      </select>

      <label>Accident Date:</label>
      <input type="date" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} style={styles.input} />

      <label>Number of Vehicles Involved:</label>
      <input
        type="number"
        min="1"
        max="5"
        value={numVehicles}
        onChange={(e) => {
          const num = Math.max(1, Math.min(5, Number(e.target.value)));
          setNumVehicles(num);
          updateVehicleInputs(num);
        }}
        style={styles.input}
      />

      {vehicles.map((vehicle, index) => (
        <div key={index} style={styles.vehicleContainer}>
          <label>Vehicle {index + 1} Number:</label>
          <input type="text" value={vehicle.number} onChange={(e) => handleVehicleChange(index, "number", e.target.value)} style={styles.input} />
          <label>Vehicle {index + 1} Type:</label>
          <select value={vehicle.type} onChange={(e) => handleVehicleChange(index, "type", e.target.value)} style={styles.input}>
            <option value="">Select vehicle type</option>
            {vehicleTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={handleAddAccident} style={styles.button}>Report Accident</button>
    </div>
  );
};


const styles = {
    container: {
      width: "60%",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: "#f4f4f4",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#007bff",
      color: "white",
      fontSize: "18px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    message: {
      color: "green",
      fontWeight: "bold",
    },
  };
  

export default AccidentDashboard;