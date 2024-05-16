import express from 'express';
import * as dotenv from 'dotenv';
import { Search } from '../controllers/SearchController.js';
dotenv.config();

const router = express.Router();

//Route for searching articles
router.get('/search-articles', Search);

export default router;