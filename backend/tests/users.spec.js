const request = require("supertest");

const mock_user = {
  _id: '120389d9sjkwnksja',
  firstname: 'bob',
  lastname: 'fisher',
  displayname: 'the_bobster',
  confirmed: true,
  email: 'bobfisher@gmail.com',
  password: '123cats',
  balance: 9923.87,
  account_creation_date: "2024-01-08",
  total_earnings: -5.22,
  base_cost: 76.13,
  daily_refresh_limit: 25,
  past_total_earnings: [
    {
      date: "2024-01-08",
      total_earnings: 10000,
      _id: "98fdgk239ds0a"
    },
    {
      date: "2024-01-09",
      total_earnings: 9994.78,
      _id: "98fdgk239ds0a"
    },
  ],
  portfolio: [
    {
      stock: "SRE",
      transaction_date: [
        {
          purchase_type: "Buy",
          date: "2024-01-08",
          _id: '19238kjxcc8912j2'
        }
      ],
      average_cost: 76.13,
      quantity: 1,
      latest_price: 70.91,
      unrealized_value: -5.22,
      last_updated: "2024-01-09",
      _id: "fv98721vc3948ujo834134134df"
    }
  ],
  transaction_history: [
    {
      stock: "SRE",
      purchase_type: "Buy",
      date: "2024-01-08",
      quantity: 1,
      _id: "sdrifogup5voim34uwuy58734"
    }
  ],
  createdAt: "2024-01-08T20:44:18.818+00:00",
  updatedAt: "2024-01-09T15:44:18.818+00:00"
}

describe("Test /users api call get requests", () => {

  it("tests /users/ endpoints", async () => {
    const response = await request(app).get("/space/destinations");
    expect(response.body).toHaveLength(6);
    expect(response.statusCode).toBe(200);
    // Testing a single element in the array
    expect(response.body).toEqual(expect.arrayContaining(["Earth"]));
  });

  // Insert other tests below this line

  // Insert other tests above this line
});