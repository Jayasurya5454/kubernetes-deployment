import Reminder from '../models/remainder.js';
import nodemailer from 'nodemailer';
import schedule from 'node-schedule';


const sendEmail = async (userEmail,subject,text) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,  // Use 465 for SSL
        secure: true, // Set to true for SSL
        auth: {
            user: process.env.USER, // Your Gmail address
            pass: process.env.PASS, // Your Gmail app password
        },
    });    
    
        
    
        const mailOptions = {
            from: process.env.USER,
            to: userEmail, // Make sure to store and use the user's email in the reminder
            subject,
            text,
        };
    
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    //Function to reload and schedule all reminders from the database
    const reloadReminders = async () => {
        try {
            const reminders = await Reminder.find();
            reminders.forEach(async (reminder) => {
                const reminderTime = new Date(reminder.lastDate);
                reminderTime.setDate(reminderTime.getDate() - 2);
                
                if (reminderTime > new Date()) {  // Schedule only future reminders
                    console.log(`Scheduling reminder for ${reminder.name} on ${reminderTime}`);
                    schedule.scheduleJob(reminderTime, async () => {
                        console.log("Sending scheduled reminder email...");
                        await sendEmail(
                            reminder.userEmail,
                            `Upcoming Due Date for ${reminder.name}`,
                            `This is a reminder that your bill/EMI "${reminder.name}" of amount $${reminder.amount} is due on ${reminder.lastDate}.`
                        );
                    });
                } else {
                    console.log(`Sending immediate overdue reminder email for ${reminder.name}`);
                    await sendEmail(
                        reminder.userEmail,
                        `Urgent Reminder: ${reminder.name} is Due Soon`,
                        `This is a reminder that your bill/EMI "${reminder.name}" of amount $${reminder.amount} was due on ${reminder.lastDate}.`
                    );
    
                    // Delete overdue reminder from database
                    await Reminder.findByIdAndDelete(reminder._id);
                    console.log(`Overdue reminder for ${reminder.name} deleted from database.`);
                }
            });
        } catch (error) {
            console.error('Error reloading reminders:', error);
        }
    };
    

// Call reloadReminders at server startup
reloadReminders();

// Endpoint to create a new reminder
// Endpoint to create a new reminder
export const addReminder = async (req, res) => {
    const { userId, name, amount, lastDate, userEmail } = req.body;

    if (!userId || !name || !amount || !lastDate || !userEmail) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const reminder = await Reminder.create({ userId, name, amount, lastDate, userEmail });

        // Check if due date is today or tomorrow
        const today = new Date();
        const dueDate = new Date(lastDate);
        const timeDifference = dueDate - today;
        const oneDayInMs = 24 * 60 * 60 * 1000;

        // Send reminder email immediately if due date is today or tomorrow
        if (timeDifference <= oneDayInMs) {
            console.log("Sending immediate reminder email...");
            await sendEmail(
                userEmail,
                `Urgent Reminder: ${name} is Due Soon`,
                `This is a reminder that your bill/EMI "${name}" of amount $${amount} is due on ${lastDate}.`
            );
            await Reminder.findByIdAndDelete(reminder._id);
        } else {
            // Schedule confirmation email (1 minute after the reminder is added) only if the due date is not today or tomorrow
            const confirmationTime = new Date();
            confirmationTime.setSeconds(confirmationTime.getSeconds() + 5); // Schedule for 5 seconds later

            console.log(`Confirmation email scheduled for: ${confirmationTime}`);
            schedule.scheduleJob(confirmationTime, async () => {
            console.log("Sending confirmation email...");
            await sendEmail(
        userEmail,
        `Reminder Noted: ${name}`,
        `Your reminder for "${name}" with an amount of $${amount} has been noted. A reminder will be sent two days before the due date (${lastDate}).`
    );
});
            // Schedule reminder email 2 days before the due date
            const reminderTime = new Date(lastDate);
            reminderTime.setDate(reminderTime.getDate() - 2);

            console.log(`Reminder email scheduled for: ${reminderTime}`);
            schedule.scheduleJob(reminderTime, async () => {
                console.log("Sending scheduled reminder email...");
                await sendEmail(
                    userEmail,
                    `Upcoming Due Date for ${name}`,
                    `This is a reminder that your bill/EMI "${name}" of amount $${amount} is due on ${lastDate}.`
                );
            });
        }

        res.status(201).json(reminder);
    } catch (error) {
        console.error("Error adding reminder:", error);
        res.status(500).json({ message: "Error creating reminder", error });
    }
};