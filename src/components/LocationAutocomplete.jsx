import React from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

function LocationAutocomplete() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyC5SPTutMRcaSxMvHExAb4e-eOLL4hhO8o" libraries={libraries}>
      <Autocomplete>
        <input type="text" placeholder="Enter location" />
      </Autocomplete>
    </LoadScript>
  );
}

export default LocationAutocomplete;
