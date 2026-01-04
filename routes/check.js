const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const Checks = require("../models/checks");
const Transactions = require("../models/transactions");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isCustomer, isEmployee, ownsAccount } = require("../middleware/auth");
const { validationRules } = require("../middleware/validator");
const transactionService = require("../services/transactionService");
const emailService = require("../services/emailService");
const { genCheckId } = require("../utils/idGenerator");

// GET Check entry page (Customer)
router.get("/cus/check", isLoggedIn, isCustomer, asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user.userid).populate("account");
    if (!customer) {
        return res.status(404).send("Customer not found");
    }
    res.render("checks/entry", { customer: customer });
}));

// GET Account checks
router.get("/cus/check/:id", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id).populate("check");
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("checks/show", { account: account });
}));

// POST Generate checkbook
router.get("/cus/check/:id/gencheck", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).send("Account not found");
        }

        if (!account.isAccepted) {
            return res.status(400).send("Account must be activated before generating checks");
        }

        const checkCount = await Checks.countDocuments();
        const check = await Checks.create({
            checkno: genCheckId(checkCount + 1)
        });

        account.check.push(check._id);
        await account.save();

        res.redirect(`/cus/check/${req.params.id}`);
    } catch (error) {
        console.error('Check generation error:', error);
        res.status(500).send("Failed to generate check: " + error.message);
    }
}));

// POST Report check as lost
router.post("/cus/check/:id/:checkid", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    try {
        const check = await Checks.findById(req.params.checkid);
        if (!check) {
            return res.status(404).send("Check not found");
        }

        check.isLost = true;
        await check.save();

        res.redirect(`/cus/check/${req.params.id}`);
    } catch (error) {
        console.error('Check report error:', error);
        res.status(500).send("Failed to report check: " + error.message);
    }
}));

// GET Employee check entry page
router.get("/emp/addcheck/", isLoggedIn, isEmployee, (req, res) => {
    res.render("checks/empcheck");
});

// POST Process check transaction (Employee)
router.post("/emp/addcheck/", isLoggedIn, isEmployee, validationRules.checkTransaction, asyncHandler(async (req, res) => {
    try {
        const { checkno, from, to, amount } = req.body.check;

        // Find check
        const check = await Checks.findOne({ checkno: checkno });
        if (!check) {
            return res.status(404).send("Invalid check number");
        }

        if (check.isUsed) {
            return res.status(400).send("Check has already been used");
        }

        if (check.isLost) {
            return res.status(400).send("Check has been reported as lost");
        }

        // Find accounts
        const senderAccount = await Account.findOne({ accountno: parseInt(from) });
        const receiverAccount = await Account.findOne({ accountno: parseInt(to) });

        if (!senderAccount) {
            return res.status(404).send("Sender account not found");
        }

        if (!receiverAccount) {
            return res.status(404).send("Receiver account not found");
        }

        if (!senderAccount.isAccepted || !receiverAccount.isAccepted) {
            return res.status(400).send("One or both accounts are not activated");
        }

        // Perform transfer
        const transferResult = await transactionService.transfer(
            parseInt(from),
            parseInt(to),
            parseFloat(amount)
        );

        if (!transferResult.success) {
            return res.status(400).send("Transaction failed: " + (transferResult.message || "Unknown error"));
        }

        // Mark check as used
        check.isUsed = true;
        check.amount = parseFloat(amount);
        check.from = senderAccount._id;
        check.to = receiverAccount._id;
        await check.save();

        // Create transaction record
        const transaction = await Transactions.create({
            from: parseInt(from),
            to: parseInt(to),
            amount: parseFloat(amount),
            isCheck: true
        });

        // Update account transaction arrays
        senderAccount.transactions.push(transaction._id);
        receiverAccount.transactions.push(transaction._id);
        await senderAccount.save();
        await receiverAccount.save();

        // Send email notifications
        try {
            if (senderAccount.email) {
                await emailService.sendTransactionNotification(
                    senderAccount.email,
                    amount,
                    'debit',
                    from
                );
            }
            if (receiverAccount.email) {
                await emailService.sendTransactionNotification(
                    receiverAccount.email,
                    amount,
                    'credit',
                    to
                );
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail transaction if email fails
        }

        res.send("success");
    } catch (error) {
        console.error('Check transaction error:', error);
        res.status(500).send("Transaction failed: " + error.message);
    }
}));

module.exports = router;
