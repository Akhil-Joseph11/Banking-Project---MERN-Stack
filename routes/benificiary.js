const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const Benificiary = require("../models/benificiary");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isCustomer, ownsAccount } = require("../middleware/auth");
const { validationRules } = require("../middleware/validator");

// GET Beneficiaries entry page
router.get("/cus/benificiary", isLoggedIn, isCustomer, asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user.userid).populate("account");
    if (!customer) {
        return res.status(404).send("Customer not found");
    }
    res.render("benificiary/entry", { customer: customer });
}));

// GET Account beneficiaries
router.get("/cus/benificiary/:id", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id).populate("benificiary");
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("benificiary/benificiary", { account: account });
}));

// GET New beneficiary page
router.get("/cus/benificiary/:id/new", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id);
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("benificiary/new", { account: account });
}));

// POST Add beneficiary
router.post("/cus/benificiary/:id", isLoggedIn, isCustomer, ownsAccount, validationRules.beneficiary, asyncHandler(async (req, res) => {
    try {
        const { accountno, username } = req.body.benificiary;
        
        // Check if beneficiary account exists
        const beneficiaryAccount = await Account.findOne({ accountno: accountno });
        if (!beneficiaryAccount) {
            return res.status(404).send("Beneficiary account not found");
        }

        // Check if beneficiary is already added
        const account = await Account.findById(req.params.id).populate("benificiary");
        const existingBeneficiary = account.benificiary.find(b => b.accountno === accountno);
        if (existingBeneficiary) {
            return res.status(400).send("Beneficiary already added");
        }

        // Cannot add own account as beneficiary
        if (account.accountno.toString() === accountno.toString()) {
            return res.status(400).send("Cannot add your own account as beneficiary");
        }

        // Create beneficiary
        const beneficiaryData = {
            ...req.body.benificiary,
            accountno: accountno,
            username: username.trim(),
            isAccepted: true // Auto-accept if account exists
        };

        const beneficiary = await Benificiary.create(beneficiaryData);
        account.benificiary.push(beneficiary._id);
        await account.save();

        res.redirect("/cus/benificiary");
    } catch (error) {
        console.error('Beneficiary creation error:', error);
        res.status(400).send("Failed to add beneficiary: " + error.message);
    }
}));

// DELETE Remove beneficiary
router.get("/cus/benificiary/:id/:benid", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).send("Account not found");
        }

        // Remove beneficiary from account
        account.benificiary = account.benificiary.filter(
            benId => benId.toString() !== req.params.benid
        );
        await account.save();

        // Delete beneficiary record
        await Benificiary.findByIdAndDelete(req.params.benid);

        res.redirect(`/cus/benificiary/${req.params.id}`);
    } catch (error) {
        console.error('Beneficiary deletion error:', error);
        res.status(500).send("Failed to remove beneficiary: " + error.message);
    }
}));

module.exports = router;
