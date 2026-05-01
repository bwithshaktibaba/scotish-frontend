import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LoanForm from './pages/LoanForm';
import LoanOTP from './pages/LoanOTP';
import LoanSuccess from './pages/LoanSuccess';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-animated" />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ background: '#0d1b2e', border: '1px solid rgba(59,130,246,0.2)' }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/apply-loan" element={<PrivateRoute><LoanForm /></PrivateRoute>} />
        <Route path="/loan-otp" element={<PrivateRoute><LoanOTP /></PrivateRoute>} />
        <Route path="/loan-success" element={<PrivateRoute><LoanSuccess /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
