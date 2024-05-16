import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";

export const updatePortfolioInfo = async (request, response) => {
  const token = request.cookies.token;
  if (!token) {
    return response.json({ message: "Error couldn't find your cookie!" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return response.json({ message: "Couldn't verify your cookie!" })
    } else {
      const user = await User.findById(data.id);
      let updated_portfolio = [];
      let new_total_earnings = 0;
      let new_portfolio_entry;
      if (user.portfolio.length == 0) {
        new_total_earnings = 0;
      }
      for (let i = 0; i < user.portfolio.length; i++) {
        try {
          const result = await fetch(
            `https://api.marketdata.app/v1/stocks/quotes/${user.portfolio[i]["stock"]}/?token=${process.env.MARKET_DATA_TOKEN}`
          );
          const resultData = await result.json();
          let live_price = resultData.last[0];
          live_price = live_price.toFixed(2);
          const date = new Date();
          const formatted_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
          
          new_portfolio_entry = {};
          new_portfolio_entry["stock"] = user.portfolio[i]["stock"];
          new_portfolio_entry["transaction_date"] = user.portfolio[i]["transaction_date"];
          new_portfolio_entry["average_cost"] = user.portfolio[i]["average_cost"];
          new_portfolio_entry["quantity"] = user.portfolio[i]["quantity"];
          new_portfolio_entry["latest_price"] = live_price;
          new_portfolio_entry["unrealized_value"] = live_price * user.portfolio[i]["quantity"] - parseFloat(user.portfolio[i]["average_cost"]).toFixed(2) * user.portfolio[i]["quantity"];
          new_total_earnings = new_total_earnings + new_portfolio_entry["unrealized_value"];
          new_portfolio_entry["last_updated"] = formatted_date;
          updated_portfolio.push(new_portfolio_entry);
        } catch (error) {

        }
      }
      const update = await User.findByIdAndUpdate(data.id, {total_earnings: new_total_earnings, portfolio: updated_portfolio}, {});
      if (update) {
        response.json({status: true, message: "Portfolio updated!"});
      } else {
        response.json({status: false, message: "Error updating portfolio!"});
      }
    }
  })
};