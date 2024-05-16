import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
import { convertUnixTimestampToDate } from '../utils/DateHelper.js';
dotenv.config();

export const IndicesCandles = async (req, res) => {
    try {
        const stock_symbol = req.query.stock_symbol;
        //Get dates and format them
        var today = new Date();
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

        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);
        var lastWeek_formatted;
        var lastWeek_date = lastWeek.getDate();
        var lastWeek_month;

        if (lastWeek.getDate() < 10) {
            lastWeek_date = '0' + lastWeek.getDate();
        }
        if (lastWeek.getMonth() < 9) {
            lastWeek_month = '0' + (lastWeek.getMonth() + 1);
        } else if (lastWeek.getMonth() == 9) {
            lastWeek_month = '10';
        } else {
            lastWeek_month = (lastWeek.getMonth() + 1);
        }
        lastWeek_formatted = lastWeek.getFullYear() + '-' + lastWeek_month + '-' + lastWeek_date;
        const data = await fetch(
            `https://api.marketdata.app/v1/indices/candles/D/${stock_symbol}?from=${lastWeek_formatted}&to=${today_formatted}&token=${process.env.MARKET_DATA_TOKEN}`,
        );
        
        const data_result = await data.json();
        const newData = data_result.c.map((value, index) => ({
            c: value,
            t: convertUnixTimestampToDate(data_result.t[index]),
          }));
        return res.json({status: true, newData});
    } catch (error) {  
        return res.json({status: false, message: "Error pulling index candles"})
    }
};