
var today = new Date();

var filler_user_earnings = [];
for (let i = 364; i >= 0; i--) {
  filler_user_earnings.push({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).getFullYear() + '-' + (new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).getMonth() + 1) + '-' + new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).getDate(),
    total_earnings: 10000
  })
}

export const initalUserEarnings = filler_user_earnings;
