const express = require('express');
const router = express.Router();
const Customer = require("../models/customer");
const User = require("../models/user");
const Employee = require("../models/employee");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn } = require("../middleware/auth");

// GET Customer index redirect
router.get("/cus", isLoggedIn, (req, res) => {
    res.redirect("/cus/index");
});

// GET Customer index
router.get("/cus/index", isLoggedIn, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.render("index", { user: users });
}));

// GET Customer profile
router.get("/cus/profile", isLoggedIn, asyncHandler(async (req, res) => {
    try {
        if (req.user.usertype === "Customer") {
            const customer = await Customer.findById(req.user.userid).populate("account");
            if (!customer) {
                return res.status(404).send("Customer not found");
            }
            res.render("accounts/profile", { user: customer });
        } else {
            const employee = await Employee.findById(req.user.userid);
            if (!employee) {
                return res.status(404).send("Employee not found");
            }
            res.render("accounts/profile", { user: employee });
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).send("Error loading profile: " + error.message);
    }
}));

module.exports = router;
