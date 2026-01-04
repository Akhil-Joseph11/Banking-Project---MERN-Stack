# Banking Project - MERN Stack

A full-featured banking application built with Node.js, Express, MongoDB, and EJS.

## Features

- User authentication for customers and employees
- Account management and creation
- Money transfer transactions
- Beneficiary management
- Check management and processing
- Account statements
- Credit and debit card generation
- Email notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Banking-Project---MERN-Stack
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost/premierebank
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-session-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

5. Start MongoDB:
```bash
mongod
```

6. Start the application:
```bash
npm run dev  # Development mode
npm start    # Production mode
```

7. Open `http://localhost:3000` in your browser

## Project Structure

```
├── config/         Configuration files
├── middleware/     Authentication, validation, error handling
├── models/         MongoDB schemas
├── routes/         Express routes
├── services/       Business logic services
├── utils/          Utility functions
├── views/          EJS templates
├── public/         Static files
└── app.js          Main application file
```

## Security

- Input validation and sanitization
- XSS and SQL injection protection
- Rate limiting
- Secure session management
- Password hashing
- Environment variable configuration

## Routes

- `/` - Home page (requires login)
- `/login` - Login page
- `/signup` - Registration page
- `/logout` - Logout
- `/cus/*` - Customer routes
- `/emp/*` - Employee routes

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| PORT | Server port | No (default: 3000) |
| NODE_ENV | Environment mode | No |
| SESSION_SECRET | Session encryption secret | Yes |
| EMAIL_USER | Email for notifications | Optional |
| EMAIL_PASS | Email password | Optional |

## Technologies

- Express.js - Web framework
- MongoDB/Mongoose - Database
- Passport.js - Authentication
- EJS - Template engine
- Fawn - Transaction management
- Nodemailer - Email service

## License

ISC

## Author

Akhil Joseph
