const mongoose = require('mongoose');

const ATLAS_FALLBACK_URI = 'mongodb+srv://Bhatu:erqjVHEs1Nfp7IYh@cluster0.dnz39u3.mongodb.net/tryonverse?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<db_password>') || uri.includes('cluster.mongodb.net')) {
    uri = ATLAS_FALLBACK_URI;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    if (uri !== ATLAS_FALLBACK_URI) {
      try {
        console.log('🔄 Attempting connection with MongoDB Atlas fallback...');
        const fallbackConn = await mongoose.connect(ATLAS_FALLBACK_URI);
        console.log(`✅ MongoDB Connected via Atlas fallback: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`❌ [Fallback Connection Error]: ${fallbackErr.message}`);
      }
    }
    console.warn('⚠️ Server is staying alive to serve frontend. Retrying database connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;

