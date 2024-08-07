const { manitoulin_username, manitoulin_token } = process.env;
const axios = require("axios");

async function getManitoulinAuthToken() {
    const body = {
      username: manitoulin_username,
      token: manitoulin_token,
      company: "MANITOULIN",
    };
    try {
      const result = await axios({
        method: "post",
        url: "https://www.mtdirect.ca/api/users/auth",
        data: body,
      });
      const { token, detail } = result.data;
      if (detail !== "Success") {
        throw new Error('Unable to get Manitoulin token');
      }
      return token;
    } catch (error) {
      console.log("Error in Manitoulin getting auth", error);
      throw new Error('Unable to get Manitoulin token');
    }
}

module.exports = {
  getManitoulinAuthToken
}