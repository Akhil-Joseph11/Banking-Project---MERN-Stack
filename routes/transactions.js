const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const Transactions = require("../models/transactions");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isCustomer, ownsAccount } = require("../middleware/auth");
const { validationRules } = require("../middleware/validator");
const transactionService = require("../services/transactionService");
const emailService = require("../services/emailService");

// Store verification codes (In production, use Redis)
const verificationCodes = new Map();

// GET Transactions entry page
router.get("/cus/transactions", isLoggedIn, isCustomer, asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user.userid).populate("account");
    if (!customer) {
        return res.status(404).send("Customer not found");
    }
    res.render("transactions/entry", { customer: customer });
}));

// GET New transaction page
router.get("/cus/transactions/:id/new", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id).populate("benificiary");
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("transactions/new", { account: account });
}));

// POST Send verification email
router.get("/cus/transactions/:id/sendMail", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id);
    if (!account) {
        return res.status(404).send("Account not found");
    }

    const rand = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    const email = account.email || req.user.email;

    // Store verification code with expiry (10 minutes)
    verificationCodes.set(req.user._id.toString(), {
        code: rand,
        expiry: Date.now() + 10 * 60 * 1000,
        accountId: req.params.id
    });

    try {
        await emailService.sendVerificationCode(email, rand);
        res.redirect(`/cus/transactions/${req.params.id}/sendMail/new`);
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).send("Error sending verification email. Please try again.");
    }
}));

// GET Verification page
router.get("/cus/transactions/:id/sendMail/new", isLoggedIn, isCustomer, (req, res) => {
    res.render("transactions/verify", { accountid: req.params.id });
});

// POST Verify code
router.post("/cus/transactions/:id/verify", isLoggedIn, isCustomer, asyncHandler(async (req, res) => {
    const { randcode } = req.body;
    const storedCode = verificationCodes.get(req.user._id.toString());

    if (!storedCode || storedCode.code.toString() !== randcode.toString()) {
        return res.send("Invalid verification code. <a href='/cus/transactions/" + req.params.id + "/sendMail'>Try again</a>");
    }

    if (Date.now() > storedCode.expiry) {
        verificationCodes.delete(req.user._id.toString());
        return res.send("Verification code expired. <a href='/cus/transactions/" + req.params.id + "/sendMail'>Try again</a>");
    }

    // Clear verification code
    verificationCodes.delete(req.user._id.toString());
    res.redirect(`/cus/transactions/${req.params.id}/new`);
}));

// POST Create transaction
router.post("/cus/transactions/:id", isLoggedIn, isCustomer, ownsAccount, validationRules.transaction, asyncHandler(async (req, res) => {
    try {
        const { amount, benacc } = req.body.transactions;
        const account = req.account;
        
        // Check balance
        if (account.balance < amount) {
            return res.status(400).send("Insufficient balance");
        }

        // Find beneficiary account
        const beneficiary = account.benificiary.find(b => b.accountno === benacc);
        if (!beneficiary) {
            return res.status(400).send("Beneficiary not found or not added to this account");
        }

        // Find beneficiary account details
        const beneficiaryAccount = await Account.findOne({ accountno: beneficiary.accountno });
        if (!beneficiaryAccount) {
            return res.status(404).send("Beneficiary account not found");
        }

        if (!beneficiaryAccount.isAccepted) {
            return res.status(400).send("Beneficiary account is not activated");
        }

        // Perform transfer
        const transferResult = await transactionService.transfer(
            parseInt(account.accountno),
            parseInt(beneficiary.accountno),
            parseFloat(amount)
        );

        if (!transferResult.success) {
            return res.status(400).send("Transaction failed: " + transferResult.message);
        }

        // Get updated accounts
        const updatedSenderAccount = await Account.findOne({ accountno: account.accountno });
        const updatedReceiverAccount = await Account.findOne({ accountno: beneficiary.accountno });

        // Send email notifications
        try {
            if (updatedSenderAccount.email) {
                await emailService.sendTransactionNotification(
                    updatedSenderAccount.email,
                    amount,
                    'debit',
                    account.accountno
                );
            }
            if (updatedReceiverAccount.email) {
                await emailService.sendTransactionNotification(
                    updatedReceiverAccount.email,
                    amount,
                    'credit',
                    beneficiary.accountno
                );
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail transaction if email fails
        }

        res.send("success");
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).send("Transaction failed: " + error.message);
    }
}));

module.exports = router;
