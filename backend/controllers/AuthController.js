import { User } from '../models/userModel.js';
import { createSecretToken } from '../utils/SecretToken.js';
import { initalUserEarnings } from '../constants/PastEarnings.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { Token } from '../models/tokenModel.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/VerificationEmail.js';

export const Signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirm_password } = req.body;
    if (!email || !password) {
      return res.json({message: "Email and Password required"});
    }
    if (!validator.isEmail(email)) {
      return res.json({message: "Email is not valid"});
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({message: "User already exists" });
    }
    if (password != confirm_password) {
      return res.json({message: "Passwords don't match"});
    }
    const today = new Date();
    var today_formatted;
    var today_date = today.getDate();
    var today_month;
    if (today.getDate() < 10) {
      today_date = '0' + today.getDate();
    }
    if (today.getMonth() < 9) {
      today_month = '0' + (today.getMonth() + 1);
    } else if (today.getMonth() == 9) {
      today_month = '10';
    } else {
      today_month = (today.getMonth() + 1);
    }
    today_formatted = today.getFullYear() + '-' + today_month + '-' + today_date;

    const balance = 10000
    const base_cost = 0
    const total_earnings = 0
    const portfolio = []
    const confirmed = false;
    const past_total_earnings = initalUserEarnings;
    const account_creation_date = today_formatted;
    const watchlist = [];
    const transaction_history = [];
    const daily_refresh_limit = 25;
    const displayname = firstname + " " + lastname;
    const user = await User.create({ firstname, lastname, displayname, confirmed, email, password, balance,
    base_cost, total_earnings, portfolio, past_total_earnings, account_creation_date, watchlist, transaction_history,
    daily_refresh_limit});
    
    let token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex")
    }).save();

    const message = `${process.env.BASE_URL}/users/verify/${user.id}/${token.token}`;
    await sendEmail(user.email, "Verify Email", message);

    res
      .status(201)
      .json({ message: "User successfully registered, email sent to your account for verification", success: true, user });
  } catch (error) {
    console.error(error);
  }
};

export const Verify = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid Link");
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    
    if (!token) return res.status(400).send("Invalid Link");
    //await User.updateOne({ _id: user._id, confirmed: true});
    await User.findByIdAndUpdate(user._id, {confirmed: true}, {});
    await Token.findByIdAndDelete(token._id);
    res.send("email verified successfully");

  } catch (error) {
    res.status(400).send("An Error occurred");
  }
}; 

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.json({success: false, message: 'All fields are required'})
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({success: false, message:'Incorrect password or email'})
    }
    if (!user.confirmed) {
      return res.json({success: false, message:'Please confirm your email to login'})
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.json({success: false, message:'Incorrect password or email'})
    }

    const token = createSecretToken(user._id);
    res.cookie('token', token, {
      withCredientials: true,
      httpOnly: false,
    })
    res.status(201).json({ message: "User logged in successfully", success: true});

  } catch (error) {
    console.error(error);
  }
}