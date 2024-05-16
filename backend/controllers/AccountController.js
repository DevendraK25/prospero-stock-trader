import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";
import { stocks } from '../constants/StockSectors.js';

export const LoadBalance = async (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ message: "Error couldn't find your cookie!" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ message: "Couldn't verify your cookie!" })
    } else {
      const user = await User.findById(data.id)
      const updatedUser = await User.findByIdAndUpdate(data.id, { balance: 10000 + user.balance }, {});
      if (updatedUser) return res.json({
        status: true,
        user: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        balance: updatedUser.balance,
        id: updatedUser._id
      })
      else {
        return res.json({ status: false })
      }
    }
  })
};

export const decrementRefreshLimit = async (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ status: false, message: "Error couldn't find your cookie!" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false, message: "Couldn't verify your cookie!" })
    } else {
      const user = await User.findById(data.id)
      if (user.daily_refresh_limit == 0) {
        return res.json({ status: false, message: "Daily Refresh Limit reached come back tomorrow sorry!"})
      }
      const updatedUser = await User.findByIdAndUpdate(data.id, { daily_refresh_limit: (user.daily_refresh_limit - 1)}, {});
      if (updatedUser) return res.json({
        status: true,
        user: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        balance: updatedUser.balance,
        daily_refresh_limit: updatedUser.daily_refresh_limit,
        id: updatedUser._id
      })
      else {
        return res.json({ status: false })
      }
    }
  })
};

export const getPastAccountValue = async (request, response) => {
  const token = request.cookies.token;
  if (!token) {
    return response.json({ status: false, message: "Access Denied " })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return response.json({ status: false })
    } else {
      const user = await User.findById(data.id);
      return response.json(user.past_total_earnings);
    }
  })
}

export const getAccountBalance = async (request, response) => {
  // Grab 
  const token = request.cookies.token
  if (!token) {
    return response.json({ message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return response.json({ status: false })
    } else {
      const user = await User.findById(data.id)
      let total_stock_price = 0;      
      for (let i = 0; i < user.portfolio.length; i++) {
        total_stock_price = total_stock_price + parseFloat((parseFloat(user.portfolio[i]["latest_price"]).toFixed(2) * parseFloat(user.portfolio[i]["quantity"]).toFixed(2)).toFixed(2));
      }
      const percentage = ((((total_stock_price + user.balance) / (total_stock_price + user.balance - user.total_earnings)).toFixed(2) - 1) * 100).toFixed(2);
      if (user) return response.json({
        status: true,
        user: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        balance: user.balance,
        id: user._id,
        total_earnings: user.total_earnings,
        portfolio: user.portfolio,
        total_portfolio_value: total_stock_price,
        percentage: percentage,
        transaction_history: user.transaction_history,
        liked_news: user.liked_news,
        disliked_news: user.disliked_news
      })
      else {
        return response.json({ status: false })
      }
    }
  })
};

export const getTopPositions = async (request, response) => {
  const token = request.cookies.token
  if (!token) {
    return response.json({ message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return response.json({ status: false })
    } else {
      const user = await User.findById(data.id)
      if (user) {
        let first_position = {
          stock: "###",
          value: 0,
          percentage: 0,
          quantity: 0
        };
        let second_position = {
          stock: "###",
          value: 0,
          percentage: 0,
          quantity: 0
        };
        let third_position = {
          stock: "###",
          value: 0,
          percentage: 0,
          quantity: 0
        };
        let portfolio = user.portfolio;
        let total_stock_value = 0;

        for (let i = 0; i < portfolio.length; i++) {
          total_stock_value = total_stock_value + portfolio[i]["latest_price"] * portfolio[i]["quantity"];
        }

        for (let i = 0; i < portfolio.length; i++) {
          if (portfolio[i]["latest_price"] * portfolio[i]["quantity"] > first_position.value) {
            first_position.value = (portfolio[i]["latest_price"] * portfolio[i]["quantity"]).toFixed(2);
            first_position.stock = portfolio[i]["stock"];
            first_position.quantity = portfolio[i]["quantity"];
          }
        }
        for (let i = 0; i < portfolio.length; i++) {
          if (portfolio[i]["latest_price"] * portfolio[i]["quantity"] > second_position.value
            && portfolio[i]["stock"] != first_position.stock) {
            second_position.value = (portfolio[i]["latest_price"] * portfolio[i]["quantity"]).toFixed(2);
            second_position.stock = portfolio[i]["stock"];
            second_position.quantity = portfolio[i]["quantity"];
          }
        }
        for (let i = 0; i < portfolio.length; i++) {
          if (portfolio[i]["latest_price"] * portfolio[i]["quantity"] > third_position.value
            && portfolio[i]["stock"] != first_position.stock
            && portfolio[i]["stock"] != second_position.stock) {
            third_position.value = (portfolio[i]["latest_price"] * portfolio[i]["quantity"]).toFixed(2);
            third_position.stock = portfolio[i]["stock"];
            third_position.quantity = portfolio[i]["quantity"];
          }
        }
        first_position.percentage = ((parseFloat(first_position.value) / parseFloat(total_stock_value)) * 100).toFixed(2);
        second_position.percentage = ((parseFloat(second_position.value) / parseFloat(total_stock_value)) * 100).toFixed(2);
        third_position.percentage = ((parseFloat(third_position.value) / parseFloat(total_stock_value)) * 100).toFixed(2);
        return response.json({ first_position, second_position, third_position })
      } else {
        return response.json({ status: false })
      }
    }
  })
};

export const getPortfolioBreakdown = (req, res) => {
  // Grab 
  const token = req.cookies.token
  if (!token) {
    return res.json({ message: "Access Denied" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false })
    } else {
      const user = await User.findById(data.id)
      var breakdown = {
        healthcare: 0,
        materials: 0,
        consumer_staples: 0,
        financials: 0,
        industrials: 0,
        technology: 0,
        consumer_discretionary: 0,
        real_estate: 0,
        communications: 0,
        energy: 0,
        utilities: 0
      }
      for (let i = 0; i < user.portfolio.length; i++) {
        if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])] === undefined) {
          continue;
        } else {
          if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Healthcare") {
            breakdown.healthcare = parseFloat(breakdown.healthcare) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Materials") {
            breakdown.materials = parseFloat(breakdown.materials) +
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Consumer Staples") {
            breakdown.consumer_staples = parseFloat(breakdown.consumer_staples) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Financials") {
            breakdown.financials = parseFloat(breakdown.financials) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Industrals") {
            breakdown.industrials = parseFloat(breakdown.industrials) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Technology") {
            breakdown.technology = parseFloat(breakdown.technology) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Consumer Discretionary") {
            breakdown.consumer_discretionary = parseFloat(breakdown.consumer_discretionary) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Real Estate") {
            breakdown.real_estate = parseFloat(breakdown.real_estate) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Communication Services") {
            breakdown.communications = parseFloat(breakdown.communications) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Energy") {
            breakdown.energy = parseFloat(breakdown.energy) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          } else if (stocks[binarySearch(stocks, user.portfolio[i]["stock"])].Sector == "Utilities") {
            breakdown.utilities = parseFloat(breakdown.utilities) + 
            parseFloat((user.portfolio[i]["latest_price"] * user.portfolio[i]["quantity"]).toFixed(2));
          }
        }
      }

      const total_value = breakdown.healthcare + breakdown.materials + breakdown.consumer_staples +
      breakdown.financials + breakdown.industrials + breakdown.technology + breakdown.consumer_discretionary
      + breakdown.real_estate + breakdown.communications + breakdown.energy + breakdown.utilities;
      var breakdown_percentages = {
        healthcare: {value: breakdown.healthcare, percent: ((breakdown.healthcare / total_value) * 100).toFixed(2)},
        materials: {value: breakdown.materials, percent: ((breakdown.materials / total_value) * 100).toFixed(2)},
        consumer_staples: {value: breakdown.consumer_staples, percent: ((breakdown.consumer_staples / total_value) * 100).toFixed(2)},
        financials: {value: breakdown.financials, percent: ((breakdown.financials / total_value) * 100).toFixed(2)},
        industrials: {value: breakdown.industrials, percent: ((breakdown.industrials / total_value) * 100).toFixed(2)},
        technology: {value: breakdown.technology, percent: ((breakdown.technology / total_value) * 100).toFixed(2)},
        consumer_discretionary: {value: breakdown.consumer_discretionary, percent: ((breakdown.consumer_discretionary / total_value) * 100).toFixed(2)},
        real_estate: {value: breakdown.real_estate, percent: ((breakdown.real_estate / total_value) * 100).toFixed(2)},
        communications: {value: breakdown.communications, percent: ((breakdown.communications / total_value) * 100).toFixed(2)},
        energy: {value: breakdown.energy, percent: ((breakdown.energy / total_value) * 100).toFixed(2)},
        utilities: {value: breakdown.utilities, percent: ((breakdown.utilities / total_value) * 100).toFixed(2)}
      }

      return res.json({breakdown_percentages});
    }
  })
};



/** 
* Copyright 2009 Nicholas C. Zakas. All rights reserved.
* MIT-Licensed
* Uses a binary search algorithm to locate a value in the specified array. 
* @param {Array} items The array containing the item. 
* @param {variant} value The value to search for. 
* @return {int} The zero-based index of the value in the array or -1 if not found. 
*/ 
function binarySearch(items, value){
  var startIndex  = 0,
      stopIndex   = items.length - 1,
      middle      = Math.floor((stopIndex + startIndex)/2);

  while(items[middle]["Ticker"] != value && startIndex < stopIndex){

      //adjust search area
      if (value < items[middle]["Ticker"]){
          stopIndex = middle - 1;
      } else if (value > items[middle]["Ticker"]){
          startIndex = middle + 1;
      }

      //recalculate middle
      middle = Math.floor((stopIndex + startIndex)/2);
  }

  //make sure it's the right value
  return (items[middle]["Ticker"] != value) ? -1 : middle;
}