import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import RoutePage from "./pages/RoutePage"; // Add RoutePage

import "./index.css";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mvd" element={<SignUpPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
