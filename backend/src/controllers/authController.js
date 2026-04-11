const { User, WebAuthnCredential } = require('../models');
const jwt = require('jsonwebtoken');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const webAuthnAuthenticationChallenges = new Map();
const webAuthnRegistrationChallenges = new Map();
let ensurePasskeyTablePromise;

const ensurePasskeyTable = async () => {
  if (!ensurePasskeyTablePromise) {
    ensurePasskeyTablePromise = WebAuthnCredential.sync();
  }

  return ensurePasskeyTablePromise;
};

const getStoredPasskeys = async (user) => {
  await ensurePasskeyTable();

  if (user.webauthnCredentialId && user.webauthnPublicKey) {
    await WebAuthnCredential.findOrCreate({
      where: { credentialId: user.webauthnCredentialId },
      defaults: {
        userId: user.id,
        credentialId: user.webauthnCredentialId,
        publicKey: user.webauthnPublicKey,
        counter: Number(user.webauthnCounter || 0)
      }
    });
  }

  const storedPasskeys = await WebAuthnCredential.findAll({
    where: { userId: user.id }
  });

  return storedPasskeys.map((passkey) => ({
    id: passkey.credentialId,
    publicKey: passkey.publicKey,
    counter: Number(passkey.counter || 0)
  }));
};

const savePasskey = async (user, passkey) => {
  await ensurePasskeyTable();

  await WebAuthnCredential.upsert({
    userId: user.id,
    credentialId: passkey.id,
    publicKey: passkey.publicKey,
    counter: Number(passkey.counter || 0)
  });

  // Keep legacy fields populated for backward compatibility with older data flows.
  await user.update({
    webauthnCredentialId: passkey.id,
    webauthnPublicKey: passkey.publicKey,
    webauthnCounter: Number(passkey.counter || 0)
  });
};

const updatePasskeyCounter = async (user, credentialId, counter) => {
  await ensurePasskeyTable();

  await WebAuthnCredential.update(
    { counter: Number(counter || 0) },
    { where: { userId: user.id, credentialId } }
  );

  if (user.webauthnCredentialId === credentialId) {
    await user.update({ webauthnCounter: Number(counter || 0) });
  }
};

const getClientOrigin = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'] || req.headers['x-vercel-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers['x-vercel-forwarded-host'];
  const originHeader = req.headers.origin || req.headers.referer;
  const protocol = process.env.NODE_ENV === 'production'
    ? forwardedProto || req.protocol || 'https'
    : forwardedProto || req.protocol || 'http';
  const host = forwardedHost || req.headers.host || 'localhost:3000';

  if (originHeader) {
    return originHeader;
  }

  return `${protocol}://${host}`;
};

const getWebAuthnConfig = (req) => {
  const derivedOrigin = process.env.WEBAUTHN_ORIGIN || getClientOrigin(req);
  const derivedRpId = process.env.WEBAUTHN_RP_ID || new URL(derivedOrigin).hostname;

  return {
    rpID: derivedRpId,
    rpOrigin: derivedOrigin
  };
};

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
    const { rpID } = getWebAuthnConfig(req);
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passkeys = await getStoredPasskeys(user);

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
      excludeCredentials: passkeys.map((passkey) => ({
        id: Buffer.from(passkey.id, 'base64url'),
        type: 'public-key',
        transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
      }))
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
    const { rpID, rpOrigin } = getWebAuthnConfig(req);
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

    await savePasskey(user, {
      id: registeredCredential.id,
      publicKey: Buffer.from(registeredCredential.publicKey).toString('base64url'),
      counter: registeredCredential.counter || 0
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
    const { rpID } = getWebAuthnConfig(req);
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passkeys = await getStoredPasskeys(user);

    if (passkeys.length === 0) {
      return res.status(400).json({
        message: 'No biometric credential enrolled for this user. Please enroll a passkey first.'
      });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: passkeys.map((passkey) => ({
          id: Buffer.from(passkey.id, 'base64url'),
          type: 'public-key',
          transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
        }))
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
    const { rpID, rpOrigin } = getWebAuthnConfig(req);
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential is required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passkeys = await getStoredPasskeys(user);

    const challengeRecord = webAuthnAuthenticationChallenges.get(user.id);
    if (!challengeRecord || challengeRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Authentication challenge expired. Please retry.' });
    }

    if (passkeys.length === 0) {
      return res.status(400).json({
        message: 'No biometric credential enrolled for this user. Please enroll a passkey first.'
      });
    }

    const credentialId = credential.id || credential.rawId;
    const matchingPasskey = passkeys.find((passkey) => passkey.id === credentialId);

    if (!matchingPasskey) {
      return res.status(401).json({
        message: 'This device passkey is not enrolled yet. Please enroll this device first.'
      });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: rpOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: matchingPasskey.id,
        publicKey: Buffer.from(matchingPasskey.publicKey, 'base64url'),
        counter: matchingPasskey.counter || 0,
        transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
      }
    });

    if (!verification.verified) {
      return res.status(401).json({ message: 'Biometric verification failed' });
    }

    await updatePasskeyCounter(user, matchingPasskey.id, verification.authenticationInfo.newCounter);
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
