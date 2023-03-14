const axios = require("axios");
const qs = require("qs");

async function getAuthToken() {
  const body = qs.stringify({
    grant_type: "password",
    username: process.env.GOFOR_USERNAME,
    password: process.env.GOFOR_PASSWORD,
  });

  var params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", process.env.GOFOR_USERNAME);
  params.append("password", process.env.GOFOR_PASSWORD);

  const goForTokenUrl = process.env.GOFOR_TOKEN_URL;
  const { data } = await axios({
    method: "get",
    url: goForTokenUrl,
    data: params,
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });
  return data.access_token;
}

function formatDate(deliveryDate, deliveryTime) {
    try {
      let startDate = new Date(`${deliveryDate} ${deliveryTime}`);
      const endDateString = new Date(startDate.setHours(startDate.getHours() + 1));
      const endYear = endDateString.getFullYear();
      let endMonth = endDateString.getMonth() + 1;
      endMonth = ("0" + endMonth).slice(-2);
      let endDay = endDateString.getDate();
      endDay = ("0" + endDay).slice(-2);
      let endHour = endDateString.getHours(); 
      endHour = ("0" + endHour).slice(-2);
      let endMinute = endDateString.getMinutes();
      endMinute = ("0" + endMinute).slice(-2);

      startDate = `${deliveryDate} ${deliveryTime}`
      const endDate = `${endYear}-${endMonth}-${endDay} ${endHour}:${endMinute}`;
      return { startDate, endDate };
    }
    catch (err) {
        console.log(err);
    }

//   let endDate = new Date()
//     .toISOString()
//     .replace(/T/, " ") // replace T with a space
//     .replace(/\..+/, ""); // delete the dot and everything after
//   endDate = endDate.substring(0, endDate.length - 3);
//   let startDate = new Date()
//     .toISOString()
//     .replace(/T/, " ") // replace T with a space
//     .replace(/\..+/, ""); // delete the dot and everything after
//   startDate = startDate.substring(0, startDate.length - 3);

}

module.exports = {
  getAuthToken,
  formatDate,
};
