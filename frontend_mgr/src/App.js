import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyApprovals from "./Route/MyApprovals";
import NewRequests from "./Route/NewRequests";
import RequestHistory from "./myrequest";
import ForwardRequests from "./forwardRequest";
import SignIn from "./login";
import WorkflowTemplate from "./templateDashboard";
import "./App.css";
import './index.css';

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  // Check if the user is logged in, and if so, redirect them to the correct page
  return (
    <Router>
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/my-approvals" element={<Layout><MyApprovals /></Layout>} />
        <Route path="/new-requests" element={<Layout><NewRequests /></Layout>} />
        <Route path="/request-history" element={<Layout><RequestHistory /></Layout>} />
        <Route path="/forwarded-requests" element={<Layout><ForwardRequests /></Layout>} />
        <Route path="/template-enter" element={<Layout><WorkflowTemplate /></Layout>} />

        {/* Catch-all: Redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
