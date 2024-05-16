// File where middleware on the user is gonna go ie. API calls to store data every 24 hours in the
// database. Cron jobs for users will be implemented here.

import cron from 'node-cron';
import { User } from '../models/userModel.js';

export const test = () => {
  cron.schedule("0 16 * * 1-5", async () => {
    try {
      const users = await User.find({});
      const date = new Date();
      const formatted_date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
      for (let i = 0; i < users.length; i++) {
        let total_stock_price = 0;
        for (let j = 0; j < users[i].portfolio.length; j++) {
          total_stock_price = total_stock_price + parseFloat((parseFloat(users[i].portfolio[j]["latest_price"]).toFixed(2) * parseFloat(users[i].portfolio[j]["quantity"]).toFixed(2)).toFixed(2));
        }
        total_stock_price = total_stock_price + users[i]["balance"];
        const new_entry_for_total_earnings = {
          date: formatted_date,
          total_earnings: total_stock_price,
        }
        let total_earnings_portfolio = users[i]["past_total_earnings"];
        total_earnings_portfolio.push(new_entry_for_total_earnings);
        const update = await User.findByIdAndUpdate(users[i]["_id"], {daily_refresh_limit: 25, past_total_earnings: total_earnings_portfolio}, {});
        if (update) {
          console.log("User history updated")
        } else {
          console.log("error");
        }
      }
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  });
};