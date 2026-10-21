const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB Atlas using MONGO_URI from environment variables.
 * Strictly checks that a real URI is provided and logs clear diagnostics without exposing credentials.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri || mongoUri.includes('PASTE_YOUR_NEW_MONGODB_ATLAS_CONNECTION_STRING_HERE') || mongoUri === 'your_mongodb_atlas_connection_string') {
    console.warn('\n⚠️ [MongoDB Atlas Warning]');
    console.warn('MONGO_URI is not set or still contains the placeholder value in backend/.env.');
    console.warn('To connect to your database:');
    console.warn(' 1. Log into your MongoDB Atlas console (https://cloud.mongodb.com)');
    console.warn(' 2. Go to Database > Connect > Drivers > Node.js');
    console.warn(' 3. Copy your connection string and paste it into backend/.env (replace <password> with your DB user password)');
    console.warn(' 4. Ensure Network Access (IP Access List) allows your current IP or 0.0.0.0/0 for testing.');
    console.warn('------------------------------------------------------------\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ [MongoDB Atlas Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('\n❌ [MongoDB Atlas Connection Error]');
    console.error(`Message: ${error.message}`);
    console.error('Troubleshooting steps:');
    console.error(' 1. Verify that your database username and password are correct in MONGO_URI.');
    console.error(' 2. Check Network Access in Atlas (add your IP or 0.0.0.0/0 for testing).');
    console.error(' 3. Ensure the cluster is active (not paused/terminated).');
    console.error(' 4. Check for special characters in password that need URI percent-encoding.');
    console.error('------------------------------------------------------------\n');
    return false;
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };
