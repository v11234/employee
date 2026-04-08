import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import iulLogo from '../assets/iul-logo.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { preAuthToken, requiresBiometric, ...user } = response.data;

      localStorage.removeItem('token');
      localStorage.setItem('preAuthToken', preAuthToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (requiresBiometric) {
        toast.success('Password verified. Complete biometric verification to continue.');
        navigate('/biometric-verification');
      } else {
        toast.error('Biometric verification is required for this account.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'linear-gradient(135deg, #0f1f5c 0%, #1a2b6f 65%, #e5002a 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src={iulLogo}
              alt="CodingHQ Logo"
              sx={{
                mb: 2,
                width: { xs: 150, sm: 220 },
                height: { xs: 150, sm: 220 },
                objectFit: 'contain',
              }}
            />

            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: '#1a2b6f' }}>
              CodingHQ Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Coding Enterprise Management System
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#1a2b6f' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#1a2b6f' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  bgcolor: '#1a2b6f',
                  '&:hover': { bgcolor: '#0f1f5c' },
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  New team member? Contact enterprise administration.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  CodingHQ Administration | contact@codinghq.com | Ext. 1234
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                display="block"
                sx={{ mt: 3 }}
              >
                Copyright {new Date().getFullYear()} CodingHQ Enterprise
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
