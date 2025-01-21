// models/reminder.js
import mongoose from 'mongoose';

const remainderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' }, // Reference to the user
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    lastDate: { type: Date, required: true },
    userEmail: { type: String, required: true },
}, { timestamps: true });

const remainder= mongoose.model('Remainder', remainderSchema);

export default remainder;
