const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

async function getHolidaysFromAWS() {
  try {
    const ssm = new SSMClient({
      region: 'ca-central-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_SSM,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SSM,
    });
    const command = new GetParameterCommand({ 
        Name: 'holidays', 
        WithDecryption: false 
    });
    const parameter = await ssm.send(command);
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