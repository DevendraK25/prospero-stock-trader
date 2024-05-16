import express from "express";
import * as dotenv from 'dotenv';
dotenv.config();
const { PORT, MONGO_URL } = process.env;
import mongoose from "mongoose";
import usersRoute from './routes/usersRoute.js';
import newsRoute from './routes/newsRoute.js';
import searchRoute from './routes/searchRoute.js';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { test } from "./middlewares/UpdateUsersMiddleware.js";


const app = express();
app.use(cookieParser());
// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS POLICY
// Option 1: Allow All Origins with Default of cors(*)
//app.use(cors());
// Option 2: Allow Custom origins

const allowedOrigins = [
  'https://prosperoone.com',
  'http://3.97.105.207:8080',
  'https://www.prosperoone.com',
  'http://localhost:8080',
  'https://localhost:8080',
  'https://3.97.105.207:8080',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));        

app.get('/', (request, response) => {
  console.log(request);
  return response.status(234).send('Welcome to MERN Stack');
});

app.use('/users', usersRoute);
app.use('/news', newsRoute);
app.use('/search', searchRoute);

test();

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('App connected to database');
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
    
  })
  .catch((error) => {
    console.log(error);
  });
