const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('cluster.mongodb.net')) {
    console.warn('⚠️ [MongoDB] Please set your actual MongoDB Atlas connection string in Render Environment Variables.');
  }
  try {
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/tryonverse');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    console.warn('⚠️ Server is staying alive to serve frontend. Retrying database connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;
