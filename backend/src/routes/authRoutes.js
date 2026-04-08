const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect, protectPasswordStep, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/generate-registration-options', protectPasswordStep, generateRegistrationOptionsHandler);
router.post('/verify-registration', protectPasswordStep, verifyRegistrationHandler);
router.post('/generate-authentication-options', protectPasswordStep, generateAuthenticationOptionsHandler);
router.post('/verify-authentication', protectPasswordStep, verifyAuthenticationHandler);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Director only routes
router.post('/register', protect, authorize('director'), registerUser);

module.exports = router;
