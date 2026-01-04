// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Authorization middleware - Customer only
const isCustomer = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.usertype === 'Customer') {
    return next();
  }
  res.status(403).send('Access denied. Customer access required.');
};

// Authorization middleware - Employee only
const isEmployee = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.usertype === 'Employee') {
    return next();
  }
  res.status(403).send('Access denied. Employee access required.');
};

// Check if user owns the account
const ownsAccount = async (req, res, next) => {
  try {
    const Customer = require('../models/customer');
    const Account = require('../models/account');
    
    if (!req.user || req.user.usertype !== 'Customer') {
      return res.status(403).send('Access denied.');
    }

    const customer = await Customer.findById(req.user.userid);
    if (!customer) {
      return res.status(404).send('Customer not found.');
    }

    const accountId = req.params.id || req.body.accountId;
    if (!accountId) {
      return res.status(400).send('Account ID is required.');
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).send('Account not found.');
    }

    // Check if customer owns this account - handle both ObjectId and string comparison
    const ownsAccount = customer.account.some(
      accId => accId.toString() === accountId.toString()
    );

    if (!ownsAccount) {
      return res.status(403).send('Access denied. You do not own this account.');
    }

    req.account = account;
    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isLoggedIn,
  isCustomer,
  isEmployee,
  ownsAccount
};

