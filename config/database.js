const mongoose = require('mongoose');
const Fawn = require('fawn');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/premierebank', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    try {
      Fawn.init(mongoose);
    } catch (fawnError) {
      console.warn('Fawn initialization warning:', fawnError.message);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Server will continue without database connection. Some features may not work.');
  }
};

module.exports = connectDB;

