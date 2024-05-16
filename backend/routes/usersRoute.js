import express from 'express';
import { User } from '../models/userModel.js';
import { Signup, Login, Verify } from '../controllers/AuthController.js';
import { userIsLogged } from '../middlewares/AuthMiddleware.js';
import { decrementRefreshLimit, getAccountBalance, getPastAccountValue, getPortfolioBreakdown, getTopPositions } from '../controllers/AccountController.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { BuyStock, SellStock } from '../controllers/TradeController.js';
import { updatePortfolioInfo } from '../controllers/UpdateController.js';
import { CuratedNews, GetStockCandles, GetLivePrice, StockSearch, NewStockSearch } from '../controllers/StockController.js';
import { IndicesCandles } from '../controllers/IndicesController.js';
import { addWatchlistStock, getWatchlist, isOnWatchlist, removeWatchlistStock } from '../controllers/WatchlistController.js';

const router = express.Router();

// Verify User
router.post('/', userIsLogged);
//Register user to database
router.post('/register', Signup);
//Verify a user in the database
router.get("/verify/:id/:token", Verify);
//Login user
router.post('/login', Login);

//router.put('/loadbalance', LoadBalance);

// Route for getting chart data
router.get('/chart-data', GetStockCandles);
// Route for getting stock price data
router.get('/stock-price', GetLivePrice);
// Route for getting curated news
router.get('/marketnews', CuratedNews);
// Route for searching stock query
router.get('/stock-search', StockSearch);
router.get('/new-stock-search', NewStockSearch);
// Route for getting index market data
router.get('/index-candles', IndicesCandles);

// Route to add stock to watchlist
router.post('/add-watchlist-stock', addWatchlistStock);
// Route to remove stock to watchlist
router.post('/remove-watchlist-stock', removeWatchlistStock);
// Route to check if stock is in watchlist
router.post('/is-on-watchlist', isOnWatchlist);
// Route to get all stocks on watchlist
router.get('/get-watchlist', getWatchlist);

// Route to decrement user daily refresh limit
router.post('/decrement-refresh', decrementRefreshLimit);

// Route to get one user from database
router.get('/account-details', getAccountBalance);
// Route for getting top 3 positions of portfolio
router.get('/toppositions', getTopPositions);
// Route for getting the past account values of the user
router.get('/past-account-values', getPastAccountValue);
// Route for getting portfolio breakdown
router.get('/breakdown', getPortfolioBreakdown);

// Route for user to update prices in portfolio
router.post('/updateportfolio', updatePortfolioInfo);


//Trade Routes for user
router.post('/tradebuy', BuyStock);
router.post('/tradesell', SellStock);

export default router;