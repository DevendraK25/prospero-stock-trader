import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    //Author of post
    author: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    //Title of post
    title: {
      type: String,
      required: true
    },
    //Body of post
    body: {
      type: String,
      required: true
    },
    //Date when last edited
    last_edited: {
      type: Date,
      required: false
    },
    likes: {
      type: Number,
      required: true
    },
    dislikes: {
      type: Number,
      required: true
    },
    date_created: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model('Post', postSchema);