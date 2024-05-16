import express from 'express';
import * as dotenv from 'dotenv';
import { createArticle, dislikePost, getNewsArticleById, getNewsArticles, likePost } from '../controllers/NewsController.js';
dotenv.config();

const router = express.Router();
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../frontend/public/news_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

let upload = multer({ storage: storage });

//Route for user to create a post
router.post('/create-article', upload.single('photo'), createArticle);

//Route for getting all trending articles
router.get('/get-trending-articles', getNewsArticles);

//Route for getting news article
router.get('/article/:id', getNewsArticleById);

//Route for liking a news article
router.post('/article/like/:id', likePost);

//Route for disliking a new article
router.post('/article/dislike/:id', dislikePost);

export default router;