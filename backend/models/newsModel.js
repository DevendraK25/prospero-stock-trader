import mongoose from "mongoose";

const newsSchema = mongoose.Schema(
  {
    //Author of article
    author: {
      type: String,
      required: true
    },
    //Headline of article
    headline: {
      type: String,
      required: true
    },
    //Blurb of article
    blurb: {
      type: String,
      required: true
    },
    //Body of article
    body: {
      type: String,
      required: true
    },
    //Photo of article
    photo: {
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

export const News = mongoose.model('News', newsSchema);