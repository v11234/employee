const { sequelize } = require('./src/config/database');

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the Neon/Postgres database.');
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await sequelize.close();
  }
};

testDatabaseConnection();
