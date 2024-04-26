
// const Nexmo = require('nexmo');

// const nexmo = new Nexmo({
//     apiKey: '276b8329',
//     apiSecret: 'lI3LBR8lmgzcEMrz'
// });


// async function sendSMS (toPhoneNumber, message) {
//     nexmo.message.sendSms('9605942261', toPhoneNumber, message, (err, responseData) => {
//         if (err) {
//             console.error('Error sending SMS:', err);
//         } else {
//             console.log('SMS sent successfully:', responseData);
//         }
//     });
// };

// module.exports = {
//     sendSMS,
// };
const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "276b8329",
  apiSecret: "lI3LBR8lmgzcEMrz"
})
const from = "Vonage APIs"
const to = "919605942261"
const text = 'Booking Successfully '

async function sendSMS() {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

module.exports = {
    sendSMS,
};