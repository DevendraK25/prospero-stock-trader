import { News } from '../models/newsModel.js';
import * as dotenv from 'dotenv';
dotenv.config();

export const Search = async(req, res) => {
  try {
    const articles = await News.find({});
    const search_entry = req.query.search_entry;
    var filtered_articles = [];
    for (let i = 0; i < articles.length; i++) {
      if (articles[i].body.includes(search_entry)) {
        filtered_articles.push(articles[i]);
      }
    }
    return res.json({filtered_articles, search_entry});
  } catch (error) {
    console.log(error);
  }
};