import React, { useState } from 'react';
import ReceptionForm from './pages/ReceptionForm';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  const [view, setView] = useState('reception'); // 'reception' or 'doctor'
  return (
    <div className="app">
      <header>
        <button onClick={() => setView('reception')}>Reception</button>
        <button onClick={() => setView('doctor')}>Doctor PC</button>
      </header>
      <main>
        {view === 'reception' ? <ReceptionForm /> : <DoctorDashboard />}
      </main>
    </div>
  );
}
