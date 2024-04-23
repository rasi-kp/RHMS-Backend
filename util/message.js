const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(phoneNumber, message) {
    try {
        const response = await twilioClient.messages.create({
            body: message,
            from: '+12562738517',
            to: phoneNumber,
        });
        console.log('SMS sent successfully:', response.sid);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = {
    sendSMS,
};
