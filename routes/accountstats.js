const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isCustomer, ownsAccount } = require("../middleware/auth");

// GET Account statements entry page
router.get("/cus/accstatements", isLoggedIn, isCustomer, asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user.userid).populate("account");
    if (!customer) {
        return res.status(404).send("Customer not found");
    }
    res.render("accountstats/entry", { customer: customer });
}));

// GET Account statement
router.get("/cus/accstatements/:id", isLoggedIn, isCustomer, ownsAccount, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id).populate({
        path: 'transactions',
        options: { sort: { date: -1 } }
    });
    
    if (!account) {
        return res.status(404).send("Account not found");
    }
    
    res.render("accountstats/tables", { account: account });
}));

module.exports = router;
