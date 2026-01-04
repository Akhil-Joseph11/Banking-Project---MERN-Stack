const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const Account = require("../models/account");
const User = require("../models/user");
const Employee = require("../models/employee");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn, isEmployee } = require("../middleware/auth");

// GET Employee index redirect
router.get("/emp", isLoggedIn, isEmployee, (req, res) => {
    res.redirect("/emp/index");
});

// GET Employee index
router.get("/emp/index", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.render("index", { user: users });
}));

// GET All customers
router.get("/emp/customers", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const customers = await Customer.find({});
    res.render("employee/customers", { customers: customers });
}));

// GET Customer details
router.get("/emp/customers/:id", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id).populate("account");
    if (!customer) {
        return res.status(404).send("Customer not found");
    }
    res.render("employee/view", { customer: customer });
}));

// GET Edit account page
router.get("/emp/customers/:id/:accid/edit", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.accid);
    if (!account) {
        return res.status(404).send("Account not found");
    }
    res.render("employee/edit", { account: account });
}));

// GET Account requests
router.get("/emp/requests", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const accounts = await Account.find({ isAccepted: false });
    res.render("employee/request", { accounts: accounts });
}));

// PUT Accept account request
router.get("/emp/requests/:id", isLoggedIn, isEmployee, asyncHandler(async (req, res) => {
    const account = await Account.findByIdAndUpdate(
        req.params.id,
        { isAccepted: true },
        { new: true }
    );
    
    if (!account) {
        return res.status(404).send("Account not found");
    }

    res.redirect("/emp/requests");
}));

module.exports = router;
