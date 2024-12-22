const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifiedCode: {
        type: String // Optional field
    }
});

// Hash the password before saving the user model
UserSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password') || user.isNew) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Create and export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
