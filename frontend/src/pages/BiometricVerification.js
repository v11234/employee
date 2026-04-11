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
import FingerprintIcon from '@mui/icons-material/Fingerprint';
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

const normalizeRequestOptions = (options) => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  allowCredentials: (options.allowCredentials || []).map((credential) => ({
    ...credential,
    id: base64UrlToBuffer(credential.id)
  }))
});

const serializeCredential = (credential) => ({
  id: credential.id,
  rawId: bufferToBase64Url(credential.rawId),
  type: credential.type,
  response: {
    authenticatorData: bufferToBase64Url(credential.response.authenticatorData),
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
    signature: bufferToBase64Url(credential.response.signature),
    userHandle: credential.response.userHandle
      ? bufferToBase64Url(credential.response.userHandle)
      : null
  }
});

export default function BiometricVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fullToken = localStorage.getItem('token');
  const preAuthToken = localStorage.getItem('preAuthToken');

  const logoutToLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('preAuthToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const runBiometricFlow = useCallback(async () => {
    if (fullToken) {
      navigate('/dashboard');
      return;
    }

    if (!preAuthToken) {
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
        `${API_URL}/auth/generate-authentication-options`,
        {},
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );

      const publicKey = normalizeRequestOptions(optionsResponse.data);
      const assertion = await navigator.credentials.get({ publicKey });

      if (!assertion) {
        throw new Error('No biometric credential was returned by the device.');
      }

      const verifyResponse = await axios.post(
        `${API_URL}/auth/verify-authentication`,
        { credential: serializeCredential(assertion) },
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );

      const { token, ...user } = verifyResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('preAuthToken');

      toast.success('Biometric verification successful.');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Biometric verification failed.';
      setError(message);
      setLoading(false);
    }
  }, [API_URL, fullToken, navigate, preAuthToken]);

  useEffect(() => {
    runBiometricFlow();
  }, [runBiometricFlow]);

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
            Biometric Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Confirm your identity with Face ID, fingerprint, or device passkey.
          </Typography>

          {loading ? (
            <Box sx={{ py: 3 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Waiting for biometric confirmation...</Typography>
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
                startIcon={<FingerprintIcon />}
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={runBiometricFlow}
              >
                Retry Biometric
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => navigate('/enroll-passkey')}
              >
                Enroll Passkey
              </Button>

              <Button variant="outlined" fullWidth onClick={logoutToLogin}>
                Re-login
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
