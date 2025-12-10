import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WithdrawalHistory from './pages/WithdrawalHistory';
import JobHistory from './pages/JobHistory';
import Home from './pages/Home'; // New User Page

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Expert Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/withdrawals" element={<WithdrawalHistory />} />
        <Route path="/jobs-history" element={<JobHistory />} />

        {/* User Routes */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;