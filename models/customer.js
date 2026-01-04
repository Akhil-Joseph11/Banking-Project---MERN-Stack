const mongoose = require("mongoose");

const cusSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    accounttype: {
        type: String,
        enum: ['Savings', 'Current', 'Fixed Deposit']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    dob: {
        type: Date,
        validate: {
            validator: function(v) {
                return v < new Date();
            },
            message: 'Date of birth must be in the past'
        }
    },
    adhaar: {
        type: String,
        match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits']
    },
    account: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    }],
    mobile: {
        type: String,
        match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Customer", cusSchema);