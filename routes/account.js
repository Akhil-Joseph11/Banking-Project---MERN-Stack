const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const Card = require("../models/card");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isCustomer, ownsAccount } = require("../middleware/auth");
const { validationRules } = require("../middleware/validator");
const { genAccountId, genCardNumber, genCVV } = require("../utils/idGenerator");

// GET New account page
router.get("/cus/profile/acc/new", isLoggedIn, isCustomer, (req, res) => {
    res.render("accounts/new");
});

// POST Create account
router.post("/cus/profile/acc", isLoggedIn, isCustomer, validationRules.createAccount, asyncHandler(async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.userid);
        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        const accountData = {
            ...req.body.account,
            accountname: req.body.account.accountname.trim()
        };

        const newlyCreated = await Account.create(accountData);
        
        // Generate account number
        const accountCount = await Account.countDocuments();
        newlyCreated.accountno = parseInt(genAccountId(accountCount));
        await newlyCreated.save();

        customer.account.push(newlyCreated._id);
        await customer.save();

        res.redirect("/cus/profile");
    } catch (error) {
        console.error('Account creation error:', error);
        res.status(400).render("accounts/new", {
            error: error.message || "Failed to create account. Please try again."
        });
    }
}));

// GET Account details
router.get("/cus/profile/acc/:id", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id).populate("card");
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("accounts/show", { account: account });
}));

// POST Generate card
router.post("/cus/profile/acc/:id/gencard", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    try {
        const { type } = req.body;
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).send("Account not found");
        }

        if (!account.isAccepted) {
            return res.status(400).send("Account must be activated before generating cards");
        }

        if (type === "credit") {
            if (account.isCredit) {
                return res.redirect(`/cus/profile/acc/${req.params.id}`);
            }

            const cardCount = await Card.countDocuments();
            const cardNumber = genCardNumber(cardCount);
            const cvv = genCVV();

            const createdCard = await Card.create({
                cardType: "credit",
                cardno: cardNumber,
                cvv: cvv
            });

            account.card.push(createdCard._id);
            account.isCredit = true;
            await account.save();

            res.redirect(`/cus/profile/acc/${req.params.id}`);
        } else if (type === "debit") {
            if (account.isDebit) {
                return res.redirect(`/cus/profile/acc/${req.params.id}`);
            }

            const cardCount = await Card.countDocuments();
            const cardNumber = genCardNumber(cardCount);
            const cvv = genCVV();

            const createdCard = await Card.create({
                cardType: "debit",
                cardno: cardNumber,
                cvv: cvv
            });

            account.card.push(createdCard._id);
            account.isDebit = true;
            await account.save();

            res.redirect(`/cus/profile/acc/${req.params.id}`);
        } else {
            return res.status(400).send("Invalid card type");
        }
    } catch (error) {
        console.error('Card generation error:', error);
        res.status(500).send("Failed to generate card: " + error.message);
    }
}));

module.exports = router;
