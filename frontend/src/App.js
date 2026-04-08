import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a2b6f',
    },
    secondary: {
      main: '#e5002a',
    },
  },
  typography: {
    h4: {
      fontSize: '1.8rem'
    },
    h5: {
      fontSize: '1.5rem'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box'
        },
        img: {
          maxWidth: '100%',
          height: 'auto'
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto'
        }
      }
    }
  }
});

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Shifts from './pages/Shifts';
import Leave from './pages/Leave';
import Recruitment from './pages/Recruitment';
import Training from './pages/Training';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import BiometricVerification from './pages/BiometricVerification';
import EnrollPasskey from './pages/EnrollPasskey';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function HomeRedirect() {
  const token = localStorage.getItem('token');
  const preAuthToken = localStorage.getItem('preAuthToken');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  if (preAuthToken) {
    return <Navigate to="/biometric-verification" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Default landing route */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/biometric-verification" element={<BiometricVerification />} />
          <Route path="/enroll-passkey" element={<EnrollPasskey />} />
          
          {/* Protected routes - require authentication */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/training" element={<Training />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/performance" element={<Performance />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
