import User from '../models/user.js' // Import the User model

// Save new user to MongoDB
export const saveNewUser = async (req, res) => {
  const { firebaseUID, email, name, password } = req.body; // Extract data from request body
  try {
    // Create a new user document
    const newUser = new User({
      firebaseUID,
      email,
      name,
      password, // Save password if it exists (for email/password signup)
    });
    // Save the user document to MongoDB
    await newUser.save();

    res.status(201).json({ message: 'User saved successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user', error });
  }
};
