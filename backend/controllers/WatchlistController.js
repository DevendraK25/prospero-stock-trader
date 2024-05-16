import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";

export const addWatchlistStock = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false })
    } else {
      const { stock } = req.body;
      const user = await User.findById(data.id);
      var user_watchList = user.watchlist;
      if (user.watchlist.length > 5) {
        return res.json({status: false, message: "You can only add 5 stocks to your wishlist at the moment"});
      }
      for (let i = 0; i < user_watchList.length; i++) {
        if (user_watchList[i]["stock"] == stock) {
          return res.json({status: false, message: "stock already in watchlist!"});
        }
      }
      user_watchList.push({stock: stock});
      const updatedUser = await User.findByIdAndUpdate(data.id, { watchlist: user_watchList }, {});
      if (updatedUser) return res.json({
        status: true, message: "stock added to watchlist"
      })
      else return res.json({ status: false, message: "error adding stock to watchlist" });
    }
  })
};

export const removeWatchlistStock = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false })
    } else {
      const { stock } = req.body;
      const user = await User.findById(data.id);
      var user_watchList = [];
      var original_watchlist = user.watchlist;
      for (let i = 0; i < original_watchlist.length; i++) {
        if (original_watchlist[i]["stock"] != stock) {
          user_watchList.push(original_watchlist[i]);
        }
      }
      const updatedUser = await User.findByIdAndUpdate(data.id, { watchlist: user_watchList }, {});
      if (updatedUser) return res.json({
        status: true,
        message: "stock removed from watchedlist"
      })
      else return res.json({ status: false, message: "stock failed" })
    }
  })
};

export const isOnWatchlist = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false })
    } else {
      const { stock } = req.body;
      const user = await User.findById(data.id);
      if (!user) {
        return res.json({ status: false })
      }
      var original_watchlist = user.watchlist;
      for (let i = 0; i < original_watchlist.length; i++) {
        if (original_watchlist[i]["stock"] == stock) {
          return res.json({ status: true, data: true})
        }
      }
      return res.json({status: true, data: false})
    }
  })
};

export const getWatchlist = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false })
    } else {
      const user = await User.findById(data.id);
      if (!user) {
        return res.json({ status: false})
      }
      var original_watchlist = user.watchlist;
      return res.json({status: true, watchlist: original_watchlist});
    }
  })
};