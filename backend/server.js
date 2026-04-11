const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./src/config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const recruitmentRoutes = require('./src/routes/recruitmentRoutes');
const trainingRoutes = require('./src/routes/trainingRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/training', trainingRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'IUL University Management API is running!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

module.exports = app;

if (require.main === module) {
  startServer();
}
