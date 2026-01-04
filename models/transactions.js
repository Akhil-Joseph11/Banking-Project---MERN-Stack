const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    from: {
        type: Number,
        required: [true, 'Sender account number is required'],
        index: true
    },
    to: {
        type: Number,
        required: [true, 'Receiver account number is required'],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    isCheck: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
transactionSchema.index({ from: 1, date: -1 });
transactionSchema.index({ to: 1, date: -1 });

module.exports = mongoose.model("Transactions", transactionSchema);