import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { db, appId } from './config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { SEED_DATA } from './utils/constants';

import Navbar from './components/layout/Navbar';
import Notification from './components/common/Notification';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/Home/LandingPage';
import AuthScreen from './pages/Auth/LoginRegister';
import Profile from './pages/User/Profile';
import PaymentReport from './pages/User/PaymentReport';
import ScheduleView from './pages/Schedule/ScheduleView';
import AdminDashboard from './pages/Admin/Dashboard';

function App() {
  const { user, userData, loading, notification } = useAuth();
  const [gymData, setGymData] = useState(null);
  const location = useLocation();

  // Fetch Gym Data Logic
  useEffect(() => {
    const contentRef = doc(db, 'artifacts', appId, 'public', 'content');
    const unsub = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        setGymData(docSnap.data());
      } else {
        console.log("Creating Seed Data...");
        setDoc(contentRef, SEED_DATA);
        setGymData(SEED_DATA);
      }
    });
    return () => unsub();
  }, []);

  // Protected Route Wrapper
  const RequireAuth = ({ children }) => {
    if (loading) return null; // Or a spinner
    if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
    return children;
  };

  const RequireAdmin = ({ children }) => {
    if (loading) return null;
    if (!user || userData?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
  };

  if (!gymData) return <div className="min-h-screen bg-black flex items-center justify-center text-brand-green font-display italic animate-pulse">CARGANDO RECURSOS...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-brand-green selection:text-black">
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage data={gymData} />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/schedule" element={<ScheduleView gymData={gymData} />} />

        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        } />

        <Route path="/payment" element={
          <RequireAuth>
            <PaymentReport gymData={gymData} />
          </RequireAuth>
        } />

        <Route path="/admin" element={
          <RequireAdmin>
            <AdminDashboard gymData={gymData} setGymData={setGymData} />
          </RequireAdmin>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {notification && <Notification notification={notification} />}
    </div>
  );
}

export default App;
