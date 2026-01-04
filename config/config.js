require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost/premierebank',
  sessionSecret: process.env.SESSION_SECRET || 'this-is-a-default-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  },
  appName: process.env.APP_NAME || 'Premiere Bank'
};

