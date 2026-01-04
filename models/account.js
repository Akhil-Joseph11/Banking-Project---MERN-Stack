const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
    accountno: {
        type: Number,
        unique: true,
        required: true,
        index: true
    },
    accountname: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true,
        minlength: [2, 'Account name must be at least 2 characters'],
        maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        trim: true
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative'],
        get: function(value) {
            return Math.round(value * 100) / 100; // Round to 2 decimal places
        }
    },
    accounttype: {
        type: String,
        required: [true, 'Account type is required'],
        enum: ['Savings', 'Current', 'Fixed Deposit']
    },
    mobile: {
        type: String,
        match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    pin: {
        type: Number,
        required: [true, 'PIN is required'],
        min: [1000, 'PIN must be a 4-digit number'],
        max: [9999, 'PIN must be a 4-digit number']
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    benificiary: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Benificiary"
    }],
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transactions"
    }],
    check: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checks"
    }],
    card: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card"
    }],
    isCredit: {
        type: Boolean,
        default: false
    },
    isDebit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
accountSchema.index({ accountno: 1 });
accountSchema.index({ isAccepted: 1 });

module.exports = mongoose.model("Account", accountSchema);