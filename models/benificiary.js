const mongoose = require("mongoose");

const benificiarySchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [2, 'Username must be at least 2 characters'],
        maxlength: [100, 'Username cannot exceed 100 characters']
    },
    accountno: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    mobile: {
        type: String,
        match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'],
        trim: true
    },
    isAccepted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Benificiary", benificiarySchema);