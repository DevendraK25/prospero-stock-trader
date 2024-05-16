import * as dotenv from 'dotenv';
import { convertUnixTimestampToDate } from '../utils/DateHelper.js';
import { stocks } from '../constants/StockSectors.js';
dotenv.config();
import levenshtein from "js-levenshtein";

export const CuratedNews = async (req, res) => {
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
    
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
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
      `https://finnhub.io/api/v1/company-news?symbol=${stock_symbol}&from=${lastWeek_formatted}&to=${today_formatted}&token=${process.env.FINNHUB_API_TOKEN}`,
    );
    const data_result = await data.json();
    let market_news = []
    for (let i = 0; i < data_result.length; i++) {
      market_news.push(data_result[i]);
      if (i == 4) {
        break;
      }
    }
    return res.json(market_news);
  } catch (error) {
    return res.json({status: false, message: "Error grabbing curated news"});
  }
};

export const GetStockCandles = async (req, res) => {
  try {
    const stock_symbol = req.query.stock_symbol;
    const date = new Date();
    const result = await fetch(
      `https://api.marketdata.app/v1/stocks/candles/D/${stock_symbol}?from=${date.getFullYear() - 1}-01-01&to=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}&token=${process.env.MARKET_DATA_TOKEN}`
    );
    const resultData = await result.json();
    const newData = resultData.c.map((value, index) => ({
      c: value,
      t: convertUnixTimestampToDate(resultData.t[index]),
    }));
    return res.json({status: true, newData, resultData});
  } catch (error) {
    return res.json({status: false, message: "Error return stock candle"});
  }
};

export const GetLivePrice = async (req, res) => {
  try {
    const body = req.query.stock_symbol;
    const stock_symbol = body;
    const result = await fetch(
      `https://api.marketdata.app/v1/stocks/quotes/${stock_symbol}/?token=${process.env.MARKET_DATA_TOKEN}`
    );
    const resultData = await result.json();
    let newData = resultData.last[0];
    newData = newData.toFixed(2);
    var stock_name = "#";
    for (let i = 0; i < stocks.length; i++) {
      if (stocks[i]["Ticker"] == stock_symbol) {
        stock_name = stocks[i]["Company Name"];
      }
    }
    
    const date = new Date();
    const result2 = await fetch(
      `https://api.marketdata.app/v1/stocks/candles/D/${stock_symbol}?from=${date.getFullYear() - 1}-${date.getMonth() + 1}-${date.getDate()}&to=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}&token=${process.env.MARKET_DATA_TOKEN}`
    );
    const resultData2 = await result2.json();
    var fiftyTwoWeekAverageVolume = 0;
    var fiftyTwoWeekHigh = 0;
    var fiftyTwoWeekLow = Number.POSITIVE_INFINITY;
    for (let i = 0; i < resultData2.v.length; i++) {
      fiftyTwoWeekAverageVolume += resultData2.v[i]
      fiftyTwoWeekHigh = Math.max(fiftyTwoWeekHigh, resultData2.h[i]);
      fiftyTwoWeekLow = Math.min(fiftyTwoWeekLow, resultData2.l[i]);
    }
    fiftyTwoWeekAverageVolume = Math.round(fiftyTwoWeekAverageVolume / resultData2.v.length);
    console.log(resultData);
    return res.json({status: true, 
                     stock_price: newData, 
                     stock_ask: resultData.ask[0], 
                     stock_bid: resultData.bid[0],
                     stock_name: stock_name,
                     stock_volume_today: resultData2.v[resultData2.v.length - 1],
                     stock_open: resultData2.o[resultData2.o.length - 1],
                     stock_low: resultData2.l[resultData2.l.length - 1],
                     stock_close: resultData2.c[resultData2.c.length - 1],
                     stock_high: resultData2.h[resultData2.h.length - 1],
                     stock_average_volume: fiftyTwoWeekAverageVolume,
                     stock_year_low: fiftyTwoWeekLow,
                     stock_year_high: fiftyTwoWeekHigh,
                     stock_change: resultData.changepct});
  } catch (error) {
    return res.json({status: false, message: "Error returning live price"});
  }
}; 

export const StockSearch = async (req, res) => {
  try {
    const stock_search_query = req.query.stock_search_query;
    const data = await fetch(
      `https://finnhub.io/api/v1/search?q=${stock_search_query}&token=${process.env.FINNHUB_API_TOKEN}`
    );
    const resultData = await data.json();
    return res.json({status: true, resultData});
  } catch (error) {
    return res.json({status: false, message: "Error retrieving stocks"});
  }
}

export const NewStockSearch = async (req, res) => {
  try {
    var search_input = req.query.stock_symbol;
    let closest_stock = "";
    let distance = Number.POSITIVE_INFINITY;
    search_input = String(search_input).toUpperCase();
    for (let i = 0; i < stocks.length; i++) {
      if (distance > levenshtein(search_input, stocks[i]["Ticker"])) {
        closest_stock = stocks[i]["Ticker"];
        distance = Math.min(levenshtein(search_input, stocks[i]["Ticker"]), distance);
      }
    }
    let second_closet_stock = "";
    let second_distance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < stocks.length; i++) {
      if (second_distance > levenshtein(search_input, stocks[i]["Ticker"]) 
          && stocks[i]["Ticker"] != closest_stock) {
          second_closet_stock = stocks[i]["Ticker"];
          second_distance = Math.min(levenshtein(search_input, stocks[i]["Ticker"]), second_distance);
      }
    }
    let third_closest_stock = "";
    let third_distance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < stocks.length; i++) {
      if (third_distance > levenshtein(search_input, stocks[i]["Ticker"]) 
          && stocks[i]["Ticker"] != closest_stock
          && stocks[i]["Ticker"] != second_closet_stock) {
          third_closest_stock = stocks[i]["Ticker"];
          third_distance = Math.min(levenshtein(search_input, stocks[i]["Ticker"]), third_distance);
      }
    }
    return res.json({status: true, first: closest_stock, second: second_closet_stock, third: third_closest_stock});
  } catch (error) {
    return res.json({status: false, message: "Error retrieving stocks"});
  }
};

