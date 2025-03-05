import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";

const LIBRARIES = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
};

const RoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const start = queryParams.get("start");
  const end = queryParams.get("end");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [directions, setDirections] = useState(null);
  const [steps, setSteps] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [routeFeatures, setRouteFeatures] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (isLoaded && start && end) {
      fetchRoute();
    }
  }, [isLoaded, start, end]);

  // 📌 Fetch Route Directions
  const fetchRoute = () => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      async (result, status) => {
        if (status === "OK") {
          setDirections(result);
          const routeSteps = result.routes[0].legs[0].steps;
          setSteps(routeSteps);
          setMapCenter(result.routes[0].legs[0].start_location.toJSON());
          console.log("Route Steps:", routeSteps.map((s) => ({
            instructions: s.instructions,
            pathLength: (s.path || []).length,
          })));

          await fetchSafetyMarkers(result.routes[0]);
          detectRouteFeatures(routeSteps, result.routes[0]);
        } else {
          console.error("Error fetching route:", status);
        }
      }
    );
  };

  // 📌 Fetch schools and hospitals along the route
  const fetchSafetyMarkers = async (route) => {
    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    const path = google.maps.geometry.encoding.decodePath(route.overview_polyline);
    console.log("Route Path Points:", path.length);

    const types = ["school", "hospital"];
    let allMarkers = [];
    let processedLocations = new Set();

    const fetchMarkersForPoint = (location, type) => {
      return new Promise((resolve) => {
        const request = {
          location: { lat: location.lat(), lng: location.lng() },
          radius: 100,
          type: type,
        };

        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const newMarkers = results
              .filter((place) => {
                const placeLatLng = place.geometry.location;
                const key = `${placeLatLng.lat()},${placeLatLng.lng()}`;
                if (processedLocations.has(key)) return false;
                return path.some((point) =>
                  google.maps.geometry.spherical.computeDistanceBetween(point, placeLatLng) < 100
                );
              })
              .map((place) => {
                const key = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;
                processedLocations.add(key);
                return {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  type: type,
                  name: place.name,
                };
              });
            console.log(`Found ${newMarkers.length} ${type}s at (${location.lat()}, ${location.lng()})`);
            resolve(newMarkers);
          } else {
            console.log(`No ${type}s found at (${location.lat()}, ${location.lng()}): ${status}`);
            resolve([]);
          }
        });
      });
    };

    for (let i = 0; i < path.length; i += Math.max(1, Math.floor(path.length / 10))) {
      for (const type of types) {
        const markersForPoint = await fetchMarkersForPoint(path[i], type);
        allMarkers = [...allMarkers, ...markersForPoint];
      }
    }

    console.log("Safety Markers:", allMarkers);
    setMarkers(allMarkers);

    if (allMarkers.length === 0) {
      setMarkers([{ lat: path[0].lat(), lng: path[0].lng(), type: "school", name: "Test School" }]);
      console.log("Added fallback school marker");
    }
  };

  // 📌 Detect junctions and curves with enhanced accuracy
  const detectRouteFeatures = (steps, route) => {
    let features = [];
    const fullPath = google.maps.geometry.encoding.decodePath(route.overview_polyline);

    steps.forEach((step, index) => {
      const path = step.path || [];
      const instructions = step.instructions.toLowerCase();

      // Junction detection: Broader yet precise
      if (
        (instructions.includes("turn") ||
         instructions.includes("roundabout") ||
         instructions.includes("fork") ||
         instructions.includes("merge") ||
         instructions.includes("exit") ||
         instructions.includes("onto")) && // Added for transitions like "Turn left onto..."
        path.length > 2
      ) {
        let maxAngleDiff = 0;
        let junctionPoint = null;

        for (let i = 1; i < path.length - 1; i++) {
          const prev = path[i - 1];
          const curr = path[i];
          const next = path[i + 1];

          const bearing1 = google.maps.geometry.spherical.computeHeading(prev, curr);
          const bearing2 = google.maps.geometry.spherical.computeHeading(curr, next);
          const angleDiff = Math.abs(bearing2 - bearing1);

          if (angleDiff > maxAngleDiff) {
            maxAngleDiff = angleDiff;
            junctionPoint = curr;
          }
        }

        if (maxAngleDiff > 20 && junctionPoint) { // Lowered to 20° to catch more junctions
          features.push({
            lat: junctionPoint.lat(),
            lng: junctionPoint.lng(),
            type: "junction",
          });
          console.log(`Junction at step ${index}: ${step.instructions} (lat: ${junctionPoint.lat()}, lng: ${junctionPoint.lng()}), Max Angle: ${maxAngleDiff.toFixed(1)}°`);
        } else {
          console.log(`Potential junction missed at step ${index}: ${step.instructions}, Max Angle: ${maxAngleDiff.toFixed(1)}°`);
        }
      } else if (path.length <= 2) {
        console.log(`Step ${index} skipped for junction: insufficient path points (${path.length})`);
      }

      // Curve detection: Adjusted for more coverage
      if (path.length > 4) { // Reduced minimum points
        const windowSize = 4; // Smaller window for finer detection
        for (let i = 0; i < path.length - windowSize; i++) {
          const points = path.slice(i, i + windowSize + 1);
          let totalAngleDiff = 0;

          for (let j = 1; j < points.length - 1; j++) {
            const prev = points[j - 1];
            const curr = points[j];
            const next = points[j + 1];

            const bearing1 = google.maps.geometry.spherical.computeHeading(prev, curr);
            const bearing2 = google.maps.geometry.spherical.computeHeading(curr, next);
            const angleDiff = Math.abs(bearing2 - bearing1);

            totalAngleDiff += angleDiff;
          }

          const avgAngleDiff = totalAngleDiff / (windowSize - 1);
          if (avgAngleDiff > 20) { // Lowered to 20° for more curves
            const midPoint = points[Math.floor(windowSize / 2)];
            features.push({
              lat: midPoint.lat(),
              lng: midPoint.lng(),
              type: "curve",
            });
            console.log(`Curve at step ${index}, point ${i}: Avg Angle ${avgAngleDiff.toFixed(1)}°`);
            i += windowSize - 1;
          }
        }
      } else {
        console.log(`Step ${index} has insufficient path points for curves: ${path.length}`);
      }
    });

    // Full path check for missed junctions and curves
    if (fullPath.length > 10) {
      for (let i = 1; i < fullPath.length - 1; i++) {
        const prev = fullPath[i - 1];
        const curr = fullPath[i];
        const next = fullPath[i + 1];

        const bearing1 = google.maps.geometry.spherical.computeHeading(prev, curr);
        const bearing2 = google.maps.geometry.spherical.computeHeading(curr, next);
        const angleDiff = Math.abs(bearing2 - bearing1);

        if (angleDiff > 45 && !features.some(f => f.type === "junction" && Math.abs(f.lat - curr.lat()) < 0.001 && Math.abs(f.lng - curr.lng()) < 0.001)) {
          features.push({
            lat: curr.lat(),
            lng: curr.lng(),
            type: "junction",
          });
          console.log(`Extra Junction from full path at point ${i}: Angle ${angleDiff.toFixed(1)}°`);
        }

        if (angleDiff > 25 && !features.some(f => f.type === "curve" && Math.abs(f.lat - curr.lat()) < 0.001 && Math.abs(f.lng - curr.lng()) < 0.001)) {
          features.push({
            lat: curr.lat(),
            lng: curr.lng(),
            type: "curve",
          });
          console.log(`Extra Curve from full path at point ${i}: Angle ${angleDiff.toFixed(1)}°`);
        }
      }
    }

    console.log("Route Features:", features);
    setRouteFeatures(features);

    if (features.length === 0 && steps.length > 0) {
      features.push({
        lat: steps[0].start_location.lat(),
        lng: steps[0].start_location.lng(),
        type: "junction",
      });
      setRouteFeatures(features);
      console.log("Added fallback junction marker");
    }
  };

  console.log("Rendering - Markers:", markers, "Route Features:", routeFeatures);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <h1 style={styles.heading}>Route Details</h1>
      <p style={styles.routeText}><strong>From:</strong> {start}</p>
      <p style={styles.routeText}><strong>To:</strong> {end}</p>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={14}
        >
          {directions && <DirectionsRenderer directions={directions} />}

          {/* 📌 Safety Markers */}
          {markers.map((marker, index) => (
            <Marker
              key={`safety-${marker.lat}-${marker.lng}-${index}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              label={{
                text: marker.type === "school" ? "S" : "H",
                fontWeight: "bold",
                color: "white",
                fontSize: "14px",
              }}
              title={marker.name}
              icon={{
                url:
                  marker.type === "school"
                    ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
            />
          ))}

          {/* 📌 Route Feature Markers */}
          {routeFeatures.map((feature, index) => (
            <Marker
              key={`feature-${feature.lat}-${feature.lng}-${index}`}
              position={{ lat: feature.lat, lng: feature.lng }}
              label={{
                text: feature.type === "junction" ? "J" : "C",
                fontWeight: "bold",
                color: "white",
                fontSize: "12px",
              }}
              title={feature.type === "junction" ? "Junction" : "Curve"}
              icon={{
                url:
                  feature.type === "junction"
                    ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <p>Loading map...</p>
      )}

      <div style={styles.stepsContainer}>
        <h2>Navigation Steps</h2>
        <ol>
          {steps.map((step, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: step.instructions }} />
          ))}
        </ol>
      </div>
    </div>
  );
};

// 🎨 Styling
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: { color: "#2c3e50", fontSize: "28px", marginBottom: "10px" },
  routeText: { fontSize: "18px", fontWeight: "bold" },
  backButton: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 15px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  stepsContainer: {
    textAlign: "left",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
  },
};

export default RoutePage;