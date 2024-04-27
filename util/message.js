const Doctor = require('../model/doctor')
const Patient = require("../model/patients")
const User = require('../model/user')

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const sendSMS = async (userid,doctorid,patientid,token,date) => {
  try {
    const user = await User.findOne({
      attributes: ['phone_no'],
      where: { user_id: userid }
    })
    const doctor = await Doctor.findOne({
      attributes: ['first_name','last_name'],
      where: { doctor_id: doctorid }
    })
    const patient = await Patient.findOne({
      attributes: ['first_name','last_name'],
      where: { patient_id: patientid }
    })
    const messageText = `Appointment success! Token No: ${token.name}, Date: ${date}, Time: ${token.time}. Doctor: ${doctor.first_name} ${doctor.last_name}, Patient: ${patient.first_name} ${patient.last_name}.`;
    const message = await client.messages.create({
        from: '+12562738517', 
        to: user.phone_no, 
        body: messageText, 
    });
} catch (error) {
    console.error('Error sending SMS:', error);
}
}

module.exports = {
  sendSMS,
};