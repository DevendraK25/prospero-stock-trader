import { News } from '../models/newsModel.js';
import { User } from '../models/userModel.js';
import * as dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";



export const createArticle = async (req, res) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.json({ message: "Error couldn't find your cookie!" })
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.json({ message: "Couldn't authenticate you" })
      } else {
        const user = await User.findById(data.id)
        if (!user.admin) {
          return res.json({
            status: false,
            message: "User not authorized to post news articles on behalf of Prospero One"
          })
        }
        const author = user.firstname + " " + user.lastname;
        const { headline, blurb, body } = req.body;
        const photo = req.file.originalname;
        console.log(photo);
        const date_created = new Date();
        const likes = 0;
        const dislikes = 0;
        await News.create({author, headline, blurb, body, photo, likes, dislikes, date_created});
        const new_article = {
          author: author,
          headline: headline,
          blurb: blurb,
          body: body,
          likes: likes,
          dislikes: dislikes,
          date_created: date_created
        }
        console.log(new_article);
        if (new_article)  {
          return res.json({
            status: true,
            article: new_article
          })
        }
        else {
          return res.json({ status: false, message: "Something went wrong..." })
        }
      }
    })
  } catch (error) {
    console.log(error);
  }
};

export const getNewsArticles = async (req, res) => {
  try {
    const articles = await News.find({});   
    return res.json(articles);
  } catch (error) {
    console.log(error);
  }
};

export const getNewsArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await News.findById(id);
    if (result) {
      return res.json({status: true, article: result});
    }
    return res.json({status: false, message: "Error grabbing article"});
  } catch (error) {
    console.log(error);
  }
}

export const likePost = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ message: "Error couldn't find your cookie!" })
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.json({ message: "Couldn't authenticate you" })
      } else {
        const user = await User.findById(data.id)
        const { id } = req.params;
        const result = await News.findById(id);
        for (let i = 0; i < user.liked_news.length; i++) {
          if (user.liked_news[i]["article_id"] == id) {
            return res.json({status: false, message: "Article already liked"});
          }
        }
        for (let i = 0; i < user.disliked_news.length; i++) {
          if (user.disliked_news[i]["article_id"] == id) {
            const likedNews = await News.findByIdAndUpdate(id, { likes: (result.likes + 1), dislikes: (result.dislikes - 1) }, {});
            var new_liked_news = user.liked_news;
            new_liked_news.push({article_id: id});
            var new_disliked_news = user.disliked_news;
            new_disliked_news.splice(i, 1);
            const updatedUser = await User.findByIdAndUpdate(data.id, {liked_news: new_liked_news, disliked_news: new_disliked_news}, {});
            if (updatedUser &&  likedNews) {
              return res.json({status: true, message: "Article liked!"});
            } else {
              return res.json({status: false, message: "Error liking article"});
            }
          }
        }
        var new_liked_news = user.liked_news;
        new_liked_news.push({article_id: id});
        const likedNews = await News.findByIdAndUpdate(id, { likes: (result.likes + 1) }, {});
        const updatedUser = await User.findByIdAndUpdate(data.id, {liked_news: new_liked_news}, {});
        if (likedNews && updatedUser) {
          return res.json({status: true, message: "Article liked"});
        }
        return res.json({status: false, message: "Error liking article"});
      }
    })
  } catch (error) {
    console.log(error);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ message: "Error couldn't find your cookie!" })
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.json({ message: "Couldn't authenticate you" })
      } else {
        const user = await User.findById(data.id)
        const { id } = req.params;
        const result = await News.findById(id);
        for (let i = 0; i < user.disliked_news.length; i++) {
          if (user.disliked_news[i]["article_id"] == id) {
            return res.json({status: false, message: "Article already disliked"});
          }
        }
        for (let i = 0; i < user.liked_news.length; i++) {
          if (user.liked_news[i]["article_id"] == id) {
            const dislikedNews = await News.findByIdAndUpdate(id, { likes: (result.likes - 1), dislikes: (result.dislikes + 1) }, {});
            var new_disliked_news = user.disliked_news;
            new_disliked_news.push({article_id: id});
            var new_liked_news = user.liked_news;
            new_liked_news.splice(i, 1);
            const updatedUser = await User.findByIdAndUpdate(data.id, {liked_news: new_liked_news, disliked_news: new_disliked_news}, {});
            if (updatedUser &&  dislikedNews) {
              return res.json({status: true, message: "Article disliked!"});
            } else {
              return res.json({status: false, message: "Error disliking article"});
            }
          }
        }
        var new_disliked_news = user.disliked_news;
        new_disliked_news.push({article_id: id});
        const dislikedNews = await News.findByIdAndUpdate(id, { dislikes: (result.dislikes + 1) }, {});
        const updatedUser = await User.findByIdAndUpdate(data.id, {disliked_news: new_disliked_news}, {});
        if (dislikedNews && updatedUser) {
          return res.json({status: true, message: "Article disliked"});
        }
        return res.json({status: false, message: "Error disliking article"});
      }
    })
  } catch (error) {
    console.log(error);
  }
};