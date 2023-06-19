const AWS = require('aws-sdk');

async function getHolidaysFromAWS() {
  try {
    const ssm = new AWS.SSM({
      region: 'ca-central-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_SSM,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SSM,
    });
    const parameter = await ssm.getParameter({ 
        Name: 'holidays', 
        WithDecryption: false 
    }).promise();
    console.log('holidays: ', JSON.stringify(parameter.Parameter.Value));
    const data = JSON.parse(parameter.Parameter.Value);
    console.log(data);
    return data;
  }
  catch (err) {
      console.log('Error getting holidays: ', err);
      return { error: 'Unable to get holidays' }
  }
}

module.exports = {
  getHolidaysFromAWS,
}