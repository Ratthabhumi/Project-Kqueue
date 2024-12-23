require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Log the MONGODB_URI to confirm it is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB using environment variable
mongoose.connect(
    process.env.MONGODB_URI,
    {
        serverSelectionTimeoutMS: 5000 // Increase timeout for server selection
    }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');
    await User.ensureIndexes(); // Ensure indexes are created
});

// Serve the login page at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the registration page at the /register path
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Serve the welcome page at the /welcome path
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Handle login form submissions
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        console.log('Input Password during login:', trimmedPassword);

        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            console.log('User not found for email:', trimmedEmail);
            return res.status(400).send('Invalid email or password');
        }

        console.log('User found:', user);
        console.log('Stored Hashed Password:', user.password);

        const isMatch = await bcrypt.compare(trimmedPassword, user.password);
        if (isMatch) {
            console.log('Login successful for email:', trimmedEmail);
            res.redirect('/welcome'); // Redirect to welcome page after successful login
        } else {
            console.log('Password does not match for email:', trimmedEmail);
            res.status(400).send('Invalid email or password');
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.status(500).send('Error logging in: ' + error.message);
    }
});

// Handle registration form submissions
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        console.log('Plaintext Password during registration:', trimmedPassword);

        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        console.log('Hashed Password during registration:', hashedPassword);

        const newUser = new User({ email: trimmedEmail, password: hashedPassword });
        await newUser.save();
        res.send('Registration successful!');
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            console.log('Duplicate email error:', error);
            res.status(400).send('Email is already registered');
        } else {
            res.status(500).send('Error registering new user: ' + error.message);
        }
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
