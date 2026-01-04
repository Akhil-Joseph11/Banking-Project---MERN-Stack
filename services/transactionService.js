const Fawn = require('fawn');
const mongoose = require('mongoose');
const Account = require('../models/account');
const Transactions = require('../models/transactions');

const transfer = async (senderAccountNo, receiverAccountNo, amount) => {
  try {
    if (!senderAccountNo || !receiverAccountNo || !amount) {
      throw new Error('Missing required parameters for transfer');
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    if (senderAccountNo === receiverAccountNo) {
      throw new Error('Cannot transfer to the same account');
    }

    const senderAccount = await Account.findOne({ accountno: senderAccountNo });
    const receiverAccount = await Account.findOne({ accountno: receiverAccountNo });

    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }

    if (!senderAccount.isAccepted) {
      throw new Error('Sender account is not activated');
    }

    if (!receiverAccount.isAccepted) {
      throw new Error('Receiver account is not activated');
    }

    if (senderAccount.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const task = Fawn.Task();
    task.update(Account, { accountno: senderAccountNo }, { $inc: { balance: -amount } });
    task.update(Account, { accountno: receiverAccountNo }, { $inc: { balance: amount } });
    
    await task.run({ useMongoose: true });

    const transaction = await Transactions.create({
      from: senderAccountNo,
      to: receiverAccountNo,
      amount: amount,
      date: new Date()
    });

    senderAccount.transactions.push(transaction._id);
    receiverAccount.transactions.push(transaction._id);
    await senderAccount.save();
    await receiverAccount.save();

    return {
      success: true,
      transaction,
      senderBalance: senderAccount.balance - amount,
      receiverBalance: receiverAccount.balance + amount
    };
  } catch (error) {
    console.error('Transfer error:', error);
    throw error;
  }
};

const hasSufficientBalance = async (accountNo, amount) => {
  try {
    const account = await Account.findOne({ accountno: accountNo });
    if (!account) {
      return false;
    }
    return account.balance >= amount;
  } catch (error) {
    console.error('Balance check error:', error);
    return false;
  }
};

module.exports = {
  transfer,
  hasSufficientBalance
};

