const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String
    },
    usertype: {
        type: String,
        required: [true, 'User type is required'],
        enum: ['Customer', 'Employee']
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'usertypeModel'
    },
    usertypeModel: {
        type: String,
        enum: ['Customer', 'Employee']
    }
}, {
    timestamps: true
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'username',
    errorMessages: {
        UserExistsError: 'A user with the given username is already registered.',
        MissingPasswordError: 'No password was given',
        AttemptTooSoonError: 'Account is currently locked. Try again later.',
        TooManyAttemptsError: 'Account locked due to too many failed login attempts',
        NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
        IncorrectPasswordError: 'Password or username are incorrect',
        IncorrectUsernameError: 'Password or username are incorrect',
        MissingUsernameError: 'No username was given',
        UserExistsError: 'A user with the given username is already registered.'
    }
});

module.exports = mongoose.model("User", userSchema);