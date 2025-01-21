// db/mongodbconnect.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

//connect env 
dotenv.config();

//connect db
const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    throw err; // Throw the error to handle it later
  }
};

export default dbconnect;
