const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const expressSession = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const config = require("./config/config");
const connectDB = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { initializeEmailService } = require("./services/emailService");

const User = require("./models/user");

const employeeRoutes = require("./routes/employee");
const customerRoutes = require("./routes/customer");
const accountRoutes = require("./routes/account");
const authRoutes = require("./routes/auth");
const benificiaryRoutes = require("./routes/benificiary");
const transactionRoutes = require("./routes/transactions");
const accstatementRoutes = require("./routes/accountstats");
const checkRoutes = require("./routes/check");

const app = express();

connectDB();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later."
});
app.use("/login", authLimiter);
app.use("/signup", authLimiter);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// View engine setup
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Session configuration
app.use(expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

initializeEmailService();
app.use(employeeRoutes);
app.use(accountRoutes);
app.use(authRoutes);
app.use(customerRoutes);
app.use(benificiaryRoutes);
app.use(transactionRoutes);
app.use(accstatementRoutes);
app.use(checkRoutes);

app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        return res.render("home");
    }
    res.redirect("/login");
});

app.use(notFound);
app.use(errorHandler);
const PORT = config.port || 3000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
});

module.exports = app;
