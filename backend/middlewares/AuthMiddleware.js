import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";
import { User } from '../models/userModel.js';

// Checks if the user is logged in to make sure they can access certain web pages.
export const userIsLogged = (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      
      return res.json({ status: false })
    } else {
      const user = await User.findById(data.id)
      if (user) return res.json({ 
        status: true, 
        user: user.email, 
        firstname: user.firstname, 
        lastname: user.lastname,
        balance: user.balance,
        id: user._id
      })
      else {
        return res.json({ status: false })
      }
    }
  })
}