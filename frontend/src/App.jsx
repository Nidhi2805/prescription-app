import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import ReceptionForm from './pages/ReceptionForm';
import DoctorDashboard from './pages/DoctorDashboard';
import SearchPatient from './pages/SearchPatient';

export default function App() {
  return (
    <div className="app">
      <header>
        <Link to="/"><button>Reception</button></Link>
        <Link to="/doctor"><button>Doctor PC</button></Link>
      </header>

      <Routes>
        <Route path="/" element={<ReceptionForm />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/search-patient" element={<SearchPatient />} />
        <Route path="/doctor/:patientId" element={<DoctorDashboard />} />
      </Routes>
    </div>
  );
}
