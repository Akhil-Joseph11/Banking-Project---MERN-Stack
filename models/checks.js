const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema({
    checkno: {
        type: String,
        required: [true, 'Check number is required'],
        unique: true,
        trim: true,
        index: true
    },
    Date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        min: [0.01, 'Amount must be greater than 0']
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    isLost: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
checkSchema.index({ checkno: 1 });
checkSchema.index({ isUsed: 1, isLost: 1 });

module.exports = mongoose.model("Checks", checkSchema);