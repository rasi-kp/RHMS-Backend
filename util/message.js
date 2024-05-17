const Doctor = require('../model/doctor')
const Patient = require("../model/patients")
const User = require('../model/user')
const nodemailer = require('nodemailer');

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const sendSMS = async (userid,doctorid,patientid,token,date) => {
  try {
    const user = await User.findOne({
      attributes: ['phone_no','email'],
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
    const messageText = `Your Appointment is success! Token No: ${token.name}, Date: ${date.day} on ${date.date}, Time: ${token.time}. Doctor: ${doctor.first_name} ${doctor.last_name}, Patient name: ${patient.first_name} ${patient.last_name}.`;
    await client.messages.create({
        from: '+12562738517', 
        to:`$(+91)${user.phone_no}`,
        body: messageText, 
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: 'rhmsonline@gmail.com',
      to: user.email,
      subject: 'Your Appointment is success!',
      text: `Your Appointment is success! Token No: ${token.name}, Date: ${date.day} on ${date.date}, Time: ${token.time}. Doctor: ${doctor.first_name} ${doctor.last_name}, Patient name: ${patient.first_name} ${patient.last_name}.`,
    };
    await transporter.sendMail(mailOptions);
} catch (error) {
    console.error('Error sending SMS:', error);
}
}

module.exports = {
  sendSMS,
};