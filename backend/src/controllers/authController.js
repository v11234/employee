const { User } = require('../models');
const jwt = require('jsonwebtoken');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const webAuthnAuthenticationChallenges = new Map();
const webAuthnRegistrationChallenges = new Map();

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const rpOrigin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

const generateToken = (id, role, stage = 'full') => {
  const biometricVerified = stage === 'full';

  return jwt.sign(
    { id, role, stage, biometricVerified },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const cleanChallengeMaps = (userId) => {
  webAuthnRegistrationChallenges.delete(userId);
  webAuthnAuthenticationChallenges.delete(userId);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (Director only)
const registerUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(user.id, user.role, 'full')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      requiresBiometric: true,
      preAuthToken: generateToken(user.id, user.role, 'password')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate WebAuthn registration options
// @route   POST /api/auth/generate-registration-options
// @access  Private (password-step token or full token)
const generateRegistrationOptionsHandler = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const options = await generateRegistrationOptions({
      rpName: process.env.WEBAUTHN_RP_NAME || 'IUL University Management System',
      rpID,
      userName: user.email,
      userDisplayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      userID: Buffer.from(`iul-user-${user.id}`, 'utf8'),
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      },
      excludeCredentials: user.webauthnCredentialId
        ? [{ id: user.webauthnCredentialId, type: 'public-key', transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble'] }]
        : []
    });

    webAuthnRegistrationChallenges.set(user.id, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify WebAuthn registration response
// @route   POST /api/auth/verify-registration
// @access  Private (password-step token or full token)
const verifyRegistrationHandler = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential is required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const challengeRecord = webAuthnRegistrationChallenges.get(user.id);
    if (!challengeRecord || challengeRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Registration challenge expired. Please retry.' });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: rpOrigin,
      expectedRPID: rpID,
      requireUserVerification: false
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(401).json({ message: 'Passkey registration failed' });
    }

    const { credential: registeredCredential } = verification.registrationInfo;

    if (!registeredCredential) {
      return res.status(401).json({ message: 'Invalid registration response' });
    }

    await user.update({
      webauthnCredentialId: registeredCredential.id,
      webauthnPublicKey: Buffer.from(registeredCredential.publicKey).toString('base64url'),
      webauthnCounter: registeredCredential.counter || 0
    });

    cleanChallengeMaps(user.id);

    res.json({
      message: 'Passkey enrolled successfully. You can now complete biometric verification.'
    });
  } catch (error) {
    res.status(401).json({ message: error.message || 'Passkey registration failed' });
  }
};

// @desc    Generate WebAuthn authentication options
// @route   POST /api/auth/generate-authentication-options
// @access  Private (password-step token or full token)
const generateAuthenticationOptionsHandler = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.webauthnCredentialId || !user.webauthnPublicKey) {
      return res.status(400).json({
        message: 'No biometric credential enrolled for this user. Please enroll a passkey first.'
      });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: [
        {
          id: user.webauthnCredentialId,
          type: 'public-key',
          transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
        }
      ]
    });

    webAuthnAuthenticationChallenges.set(user.id, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify WebAuthn authentication
// @route   POST /api/auth/verify-authentication
// @access  Private (password-step token or full token)
const verifyAuthenticationHandler = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential is required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const challengeRecord = webAuthnAuthenticationChallenges.get(user.id);
    if (!challengeRecord || challengeRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Authentication challenge expired. Please retry.' });
    }

    if (!user.webauthnCredentialId || !user.webauthnPublicKey) {
      return res.status(400).json({
        message: 'No biometric credential enrolled for this user. Please enroll a passkey first.'
      });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: rpOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: user.webauthnCredentialId,
        publicKey: Buffer.from(user.webauthnPublicKey, 'base64url'),
        counter: user.webauthnCounter || 0,
        transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
      }
    });

    if (!verification.verified) {
      return res.status(401).json({ message: 'Biometric verification failed' });
    }

    await user.update({ webauthnCounter: verification.authenticationInfo.newCounter });
    cleanChallengeMaps(user.id);

    res.json({
      message: 'Biometric authentication successful',
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(user.id, user.role, 'full')
    });
  } catch (error) {
    res.status(401).json({ message: error.message || 'Biometric verification failed' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, password } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = password;

    await user.save();

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  getProfile,
  updateProfile
};
