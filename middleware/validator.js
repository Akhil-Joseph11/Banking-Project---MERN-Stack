const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('./errorHandler');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const validationRules = {
  signup: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('usertype')
      .isIn(['Customer', 'Employee'])
      .withMessage('User type must be either Customer or Employee'),
    body('user.mobile')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage('Mobile number must be 10 digits'),
    validate
  ],

  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ],

  createAccount: [
    body('account.accountname')
      .trim()
      .notEmpty()
      .withMessage('Account name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Account name must be between 2 and 100 characters'),
    body('account.branch')
      .trim()
      .notEmpty()
      .withMessage('Branch is required'),
    body('account.accounttype')
      .isIn(['Savings', 'Current', 'Fixed Deposit'])
      .withMessage('Invalid account type'),
    body('account.mobile')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage('Mobile number must be 10 digits'),
    body('account.email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('account.pin')
      .isInt({ min: 1000, max: 9999 })
      .withMessage('PIN must be a 4-digit number'),
    validate
  ],

  transaction: [
    body('transactions.amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0')
      .toFloat(),
    body('transactions.benacc')
      .notEmpty()
      .withMessage('Beneficiary account number is required'),
    validate
  ],

  beneficiary: [
    body('benificiary.accountno')
      .trim()
      .notEmpty()
      .withMessage('Account number is required'),
    body('benificiary.username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    validate
  ],

  checkTransaction: [
    body('check.checkno')
      .trim()
      .notEmpty()
      .withMessage('Check number is required'),
    body('check.from')
      .notEmpty()
      .withMessage('Sender account number is required'),
    body('check.to')
      .notEmpty()
      .withMessage('Receiver account number is required'),
    body('check.amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0')
      .toFloat(),
    validate
  ]
};

module.exports = {
  validationRules,
  validate
};

