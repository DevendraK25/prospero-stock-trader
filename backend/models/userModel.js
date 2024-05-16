import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    displayname: {
      type: String,
      required: true,
    },
    confirmed: {
      type: Boolean,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    account_creation_date: {
      type: String,
      required: true,
    },
    daily_refresh_limit: {
      type: Number,
      required: true,
      default: 25,
    },
    // Sum of portfolio's unrealized_value * quantity
    total_earnings: {
      type: Number,
      required: true
    },
    // Sum of portfolio's average_cost * quantity
    base_cost: {
      type: Number,
      required: true
    },
    // Past values of user's total earnings
    past_total_earnings: [
      {
        date: {
          type: String,
          required: true
        },
        total_earnings: {
          type: Number,
          required: true
        }
      }
    ],
    portfolio: [
      {
        // Ticker symbol for stock
        stock: {
          type: String,
          required: true,
        },
        // List of buy and sell dates of stock
        transaction_date: [
          {
            // Either Buy or Sell
            purchase_type: {
              type: String,
              required: true,
            },
            date: {
              type: String,
              required: true,
            }
          }
        ],
        // Average cost of each share
        average_cost: {
          type: Number,
          required: true,
        },
        // Quantity of stock
        quantity: {
          type: Number,
          required: true,
        },
        // Latest price of stock
        latest_price: {
          type: Number,
          required: true,
        },
        // Difference between how much you paid vs how much its actually valued
        unrealized_value: {
          type: Number,
          required: true,
        },
        // Last time an update was made to the portfolio was placed
        last_updated: {
          type: String,
          required: true,
        }
      },
    ],
    watchlist: [
      {
        stock: {
          type: String,
          required: true
        }
      }
    ],
    transaction_history: [
      {
        stock: {
          type: String,
          required: true
        },
        purchase_type: {
          type: String,
          required: true
        },
        date: {
          type: String,
          required: true
        },
        quantity: {
          type: String,
          required: true
        },
        stock_price: {
          type: String,
          required: true
        }
      }
    ],
    posts: [
      {
        author: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        body: {
          type: String,
          required: true,
        },
        date_created: {
          type: Date,
          required: true,
        }
      }
    ],
    liked_news: [
      {
        article_id: {
          type: String,
          required: true
        },
      }
    ],
    disliked_news: [
      {
        article_id: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  this.firstname = this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1);
  this.lastname = this.lastname.charAt(0).toUpperCase() + this.lastname.slice(1);
  this.email = this.email.toLowerCase();
  this.password = await bcrypt.hash(this.password, 12);
})

export const User = mongoose.model('User', userSchema);