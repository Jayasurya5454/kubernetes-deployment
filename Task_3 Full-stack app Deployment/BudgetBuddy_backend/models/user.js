import mongoose from 'mongoose'; // Use import syntax for mongoose
const { Schema } = mongoose;

const userSchema = new Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true, // Ensures that each Firebase UID is unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique as well
  },
  name: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false, // Password only required for email/password sign-up
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User; // Export User as default
