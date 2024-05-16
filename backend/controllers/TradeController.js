import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";

export const BuyStock = async (request, response) => {
  const token = request.cookies.token
  if (!token) {
    return response.json({ message: "Error couldn't find your cookie!" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return response.json({ message: "Couldn't verify your cookie!" })
    } else {
      //Find the user in the database
      const user = await User.findById(data.id)
      //grab the stock_purchase from the request
      const stock_purchase = request.body.inputForTrade
      try {
        //Fetch live price of the stock user is trading
        const result = await fetch(
          `https://api.marketdata.app/v1/stocks/quotes/${stock_purchase.stock}/?token=${process.env.MARKET_DATA_TOKEN}`
        );
        const resultData = await result.json();
        let live_price = resultData.last[0];
        live_price = live_price.toFixed(2);
        if (live_price == 0) {
          return response.json({ message: "error computing live_price"})
        }
        if (live_price * stock_purchase.quantity > user.balance) {
          return response.json({ message: "Not enough balance to execute trade"})
        }


        const date = new Date();
        const formatted_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        const transaction_date = {
          purchase_type: "Buy",
          date: formatted_date
        }
        let new_portfolio_entry = {}
        let new_transaction_history_record = {
          stock: stock_purchase.stock,
          purchase_type: "Buy",
          date: formatted_date,
          quantity: stock_purchase.quantity,
          stock_purchase: live_price
        }
        let isExists = false;

        for (let i = 0; i < user.portfolio.length; i++) {
          if (user.portfolio[i]["stock"] == stock_purchase.stock) {
            isExists = true;

            const new_average_cost = (user.portfolio[i]["average_cost"] * user.portfolio[i]["quantity"] + stock_purchase.quantity * live_price) / (user.portfolio[i]["quantity"] + stock_purchase.quantity)
            const new_quantity = user.portfolio[i]["quantity"] + stock_purchase.quantity;
            const unrealized_value = live_price * new_quantity - new_average_cost * new_quantity;
            const last_updated = formatted_date;

            new_portfolio_entry["stock"] = user.portfolio[i]["stock"];
            new_portfolio_entry["transaction_date"] = user.portfolio[i]["transaction_date"];
            new_portfolio_entry["transaction_date"].push(transaction_date);
            
            new_portfolio_entry["average_cost"] = new_average_cost;
            new_portfolio_entry["quantity"] = new_quantity;
            new_portfolio_entry["latest_price"] = live_price;
            new_portfolio_entry["unrealized_value"] = unrealized_value;
            new_portfolio_entry["last_updated"] = last_updated;
            user.portfolio.splice(i, 1);
          }
        }
        if (!isExists) {
          const new_quantity = stock_purchase.quantity;
          const unrealized_value = 0;
          const last_updated = formatted_date;

          new_portfolio_entry["stock"] = stock_purchase.stock;
          new_portfolio_entry["transaction_date"] = [transaction_date];
          new_portfolio_entry["average_cost"] = live_price;
          new_portfolio_entry["quantity"] = new_quantity;
          new_portfolio_entry["latest_price"] = live_price;
          new_portfolio_entry["unrealized_value"] = unrealized_value;
          new_portfolio_entry["last_updated"] = last_updated;
        }
        const updated_transaction_history = user.transaction_history;
        updated_transaction_history.push(new_transaction_history_record);
        const updated_portfolio = user.portfolio;
        updated_portfolio.push(new_portfolio_entry);
        const updated_balance = (user.balance - (live_price * stock_purchase.quantity)).toFixed(2);
        const updated_base_cost = (user.base_cost + (live_price * stock_purchase.quantity)).toFixed(2);
        
        
        const updatedUser = await User.findByIdAndUpdate(data.id, {base_cost: updated_base_cost, 
                                                                   balance: updated_balance, 
                                                                   portfolio: updated_portfolio,
                                                                   transaction_history: updated_transaction_history}, {});

        if (updatedUser) return response.json({
          status: true,
          message: "Transaction completed!"
        })
      } catch (error) {
        console.log(error);
      }
    }
  })
}

export const SellStock = async (request, response) => {
  const token = request.cookies.token
  if (!token) {
    return response.json({ status: false, message: "Error couldn't find your cookie!" })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      response.json({ status: false, message: "Couldn't verify your information! Try relogging"});
    } else {
      //Find the user in the database
      const user = await User.findById(data.id)
      //grab the stock_purchase from the request
      const stock_purchase = request.body.inputForTrade
      let i;
      let stockExists = false;
      for (i = 0; i < user.portfolio.length; i++) {
        if (user.portfolio[i]["stock"] == stock_purchase.stock) {
          stockExists = true;
          break;
        }
      }
      //Check if stock is in portfolio and user has enough quantity
      if (!stockExists) {
        return response.json({ status: false, message: "Stock not found in portfolio"})
      }
      if (user.portfolio[i]["quantity"] < stock_purchase.quantity) {
        return response.json({ status: false, message: "Not holding enough stock quantity"})
      }
      //Fetch live stock price
      const result = await fetch(
        `https://api.marketdata.app/v1/stocks/quotes/${stock_purchase.stock}/?token=${process.env.MARKET_DATA_TOKEN}`
      );
      const resultData = await result.json();
      let live_price = resultData.last[0];
      live_price = live_price.toFixed(2);
      if (live_price == 0) {
        return response.json({ message: "error computing live_price"})
      }
      // Update portfolio entry first with updated information like latest_price to keep
      // information accurate.
      const updated_unrealized_value = user.portfolio[i]["unrealized_value"] - (user.portfolio[i]["unrealized_value"] * (stock_purchase.quantity / user.portfolio[i]["quantity"]));
      const new_total_earnings = user.total_earnings - (updated_unrealized_value * stock_purchase.quantity);
      const date = new Date();
      const formatted_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      
      // Create updated profile entry with up to date stock info
      const updated_portfolio_pre_trade = {
        stock: user.portfolio[i]["stock"],
        transaction_date: user.portfolio[i]["transaction_date"],
        average_cost: user.portfolio[i]["average_cost"],
        quantity: user.portfolio[i]["quantity"],
        latest_price: live_price,
        unrealized_value: updated_unrealized_value,
        last_updated: formatted_date
      }
      let new_transaction_history_record = {
        stock: stock_purchase.stock,
        purchase_type: "Sell",
        date: formatted_date,
        quantity: stock_purchase.quantity,
        stock_purchase: live_price
      }
      let transaction_history = user.transaction_history;
      transaction_history.push(new_transaction_history_record);
      let new_portfolio = user.portfolio;
      new_portfolio.splice(i, 1);
      new_portfolio.push(updated_portfolio_pre_trade);
      // Add updated profile entry to the user database
      const updatedUser = await User.findByIdAndUpdate(data.id, {total_earnings: new_total_earnings ,portfolio: new_portfolio}, {});
      if (updatedUser) {
        const updated_user = await User.findById(data.id);
        let i;
        for (i = 0; i < updated_user.portfolio.length; i++) {
          if (updated_user.portfolio[i]["stock"] == stock_purchase.stock) {
            break;
          }
        }
        if (updated_user.portfolio[i]["quantity"] == stock_purchase.quantity) {
          const new_account_balance = updated_user.balance + live_price * stock_purchase.quantity;
          const new_base_cost = updated_user.base_cost - (updated_user.portfolio[i]["average_cost"] * stock_purchase.quantity);
          const final_portfolio = updated_user.portfolio;
          final_portfolio.splice(i, 1);
          const postTransactionUser = await User.findByIdAndUpdate(data.id, {base_cost: new_base_cost, 
                                                                             balance: new_account_balance,  
                                                                             portfolio: final_portfolio, 
                                                                             transaction_history: transaction_history}, {});
          if (postTransactionUser) {
            return response.json({status: true, message: "Transaction successful"});
          }        
        } else {
          const new_account_balance = updated_user.balance + live_price * stock_purchase.quantity;
          const new_base_cost = updated_user.base_cost - (updated_user.portfolio[i]["average_cost"] * stock_purchase.quantity);
          const final_portfolio = updated_user.portfolio;

          for (let j = 0; j < final_portfolio.length; j++) {
            if (final_portfolio[j]["stock"] == stock_purchase.stock) {
              final_portfolio[j]["quantity"] = updated_user.portfolio[i]["quantity"] - stock_purchase.quantity;
              final_portfolio[j]["last_updated"] = formatted_date;
              const new_transaction_record = {
                purchase_type: "Sell",
                date: formatted_date
              }
              final_portfolio[j]["transaction_date"].push(new_transaction_record);
              final_portfolio[j]["latest_price"] = live_price;
              const postTransactionUser = await User.findByIdAndUpdate(data.id, {base_cost: new_base_cost, 
                                                                                 balance: new_account_balance,  
                                                                                 portfolio: final_portfolio,
                                                                                 transaction_history: transaction_history}, {});
              if (postTransactionUser) {
                return response.json({status: true, message: "Transaction successful"});
              }   
            }
          }
          return response.json({ message: "Transaction failed, order not placed"});
 
        }
      } else {
        return response.json({message: "Couldn't update stock info, transaction failed"});
      }
      // Edge case for if user is selling all stocks

    }
  })
};