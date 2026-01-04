const mongoose = require("mongoose");
const { genExpiryDate, genCVV } = require("../utils/idGenerator");

const cardSchema = mongoose.Schema({
    cardType: {
        type: String,
        required: [true, 'Card type is required'],
        enum: ['credit', 'debit']
    },
    cardno: {
        type: String,
        required: [true, 'Card number is required'],
        unique: true,
        trim: true
    },
    expirationDate: {
        type: String,
        default: genExpiryDate,
        required: true
    },
    cvv: {
        type: Number,
        required: [true, 'CVV is required'],
        min: [100, 'CVV must be a 3-digit number'],
        max: [999, 'CVV must be a 3-digit number']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
cardSchema.index({ cardno: 1 });

module.exports = mongoose.model("Card", cardSchema);