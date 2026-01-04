const express = require('express');
const router = express.Router();
const passport = require("passport");
const Customer = require("../models/customer");
const Account = require("../models/account");
const User = require("../models/user");
const Employee = require("../models/employee");
const { validationRules } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { isLoggedIn } = require("../middleware/auth");

// GET Login page
router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("login");
});

// POST Login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false
}), (req, res) => {
    // Success handled by passport
});

// GET Signup page
router.get("/signup", (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        res.render("signup", { error: null });
    } catch (error) {
        next(error);
    }
});

// POST Signup
router.post("/signup", validationRules.signup, asyncHandler(async (req, res, next) => {
    try {
        const { username, email, password, usertype, user } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).render("signup", {
                error: existingUser.username === username 
                    ? 'Username already taken' 
                    : 'Email already registered'
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            usertype
        });

        const registeredUser = await User.register(newUser, password);

        // Create customer or employee profile
        if (usertype === "Customer") {
            try {
                const customerData = {
                    ...user,
                    userid: registeredUser._id,
                    username: username,
                    email: email
                };
                
                const newlyCreated = await Customer.create(customerData);
                registeredUser.userid = newlyCreated._id;
                registeredUser.usertypeModel = 'Customer';
                await registeredUser.save();
                
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/cus/index");
                });
            } catch (customerError) {
                // Clean up user if customer creation fails
                await User.findByIdAndDelete(registeredUser._id);
                throw customerError;
            }
        } else {
            try {
                const employeeData = {
                    ...user,
                    userid: registeredUser._id,
                    username: username,
                    email: email
                };
                
                const newlyCreated = await Employee.create(employeeData);
                registeredUser.userid = newlyCreated._id;
                registeredUser.usertypeModel = 'Employee';
                await registeredUser.save();
                
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/emp/index");
                });
            } catch (employeeError) {
                // Clean up user if employee creation fails
                await User.findByIdAndDelete(registeredUser._id);
                throw employeeError;
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).render("signup", {
            error: error.message || 'An error occurred during registration. Please try again.'
        });
    }
}));

// GET Logout
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect("/login");
    });
});

module.exports = router;
