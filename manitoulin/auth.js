const { manitoulin_username, manitoulin_password } = process.env

export async function getManitoulinAuthToken() {
    const body = {
      username: manitoulin_username,
      password: manitoulin_password,
      company: "MANITOULIN",
    };
    try {
      const result = await axios({
        method: "post",
        url: "https://www.mtdirect.ca/api/users/auth",
        data: body,
      });
      const { token } = result.data;
      return token;
    } catch (error) {
      console.log("error getting auth", JSON.stringify(error));
      throw new Error('Unable to get Manitoulin token')
    }
}