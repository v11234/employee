import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import axios from 'axios';
import { toast } from 'react-toastify';
import iulLogo from '../assets/iul-logo.svg';
import { API_URL } from '../config/api';

const base64UrlToBuffer = (base64Url) => {
  if (base64Url instanceof ArrayBuffer) return base64Url;
  if (ArrayBuffer.isView(base64Url)) return base64Url.buffer;
  if (typeof base64Url !== 'string') {
    throw new TypeError(`Expected a base64url string or ArrayBuffer, got ${typeof base64Url}`);
  }

  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

const bufferToBase64Url = (buffer) => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const normalizeRegistrationOptions = (options) => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  user: {
    ...options.user,
    id: base64UrlToBuffer(options.user.id)
  },
  excludeCredentials: (options.excludeCredentials || []).map((credential) => ({
    ...credential,
    id: base64UrlToBuffer(credential.id)
  }))
});

const serializeRegistrationCredential = (credential) => ({
  id: credential.id,
  rawId: bufferToBase64Url(credential.rawId),
  type: credential.type,
  response: {
    attestationObject: bufferToBase64Url(credential.response.attestationObject),
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON)
  }
});

export default function EnrollPasskey() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('preAuthToken') || localStorage.getItem('token');

  const logoutToLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('preAuthToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const enrollPasskey = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!window.PublicKeyCredential || !navigator.credentials) {
      setError('WebAuthn is not supported in this browser/device.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const optionsResponse = await axios.post(
        `${API_URL}/auth/generate-registration-options`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const publicKey = normalizeRegistrationOptions(optionsResponse.data);
      const created = await navigator.credentials.create({ publicKey });

      if (!created) {
        throw new Error('No passkey credential was created.');
      }

      await axios.post(
        `${API_URL}/auth/verify-registration`,
        { credential: serializeRegistrationCredential(created) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Passkey enrolled successfully. Please verify biometrics to continue.');
      navigate('/biometric-verification');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Passkey enrollment failed.';
      setError(message);
      setLoading(false);
    }
  }, [API_URL, navigate, token]);

  useEffect(() => {
    enrollPasskey();
  }, [enrollPasskey]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'linear-gradient(135deg, #0f1f5c 0%, #1a2b6f 65%, #e5002a 100%)'
      }}
    >
      <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 460 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={iulLogo}
            alt="CodingHQ Logo"
            sx={{ width: { xs: 130, sm: 180 }, height: { xs: 130, sm: 180 }, objectFit: 'contain', mb: 1 }}
          />
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Enroll Passkey
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Register Face ID or fingerprint on this device for secure login.
          </Typography>

          {loading ? (
            <Box sx={{ py: 3 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Waiting for device passkey setup...</Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                startIcon={<KeyIcon />}
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={enrollPasskey}
              >
                Retry Enrollment
              </Button>

              <Button variant="outlined" fullWidth sx={{ mb: 1.5 }} onClick={() => navigate('/biometric-verification')}>
                Back To Biometric Verification
              </Button>

              <Button variant="text" fullWidth onClick={logoutToLogin}>
                Re-login
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
