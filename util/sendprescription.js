const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const Doctor = require('../model/doctor');
const Patient = require('../model/patients');
const User = require('../model/user'); // Ensure User model is required

const sendPrescription = async (doctorid, others) => {
    const { patientid, tablets } = others;

    try {
        const doctor = await Doctor.findOne({
            where: { doctor_id: doctorid },
            attributes: ['image', 'first_name', 'last_name', 'specialization', 'qualification']
        });
        
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const patient = await Patient.findOne({
            where: { patient_id: patientid },
            attributes: ['first_name', 'last_name', 'age', 'gender'],
            include: [{
                model: User,
                attributes: ['email'],
                required: true
            }]
        });

        if (!patient) {
            throw new Error('Patient not found');
        }

        const patientDetails = patient.get({ plain: true });

        const templatePath = path.join(__dirname, 'prescriptionpdf.html');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const template = handlebars.compile(templateSource);

        const html = template({
            doctorName: `${doctor.first_name} ${doctor.last_name}`,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            patientName: `${patientDetails.first_name} ${patientDetails.last_name}`,
            age: patientDetails.age,
            gender: patientDetails.gender,
            prescriptions: tablets
        });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: 'rhmsonline@gmail.com',
            to: patientDetails.User.email, // Correctly access the nested email attribute
            subject: 'Prescription',
            text: 'Please find attached your prescription.',
            attachments: [
                {
                    filename: 'prescription.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log('Prescription sent successfully!');
    } catch (error) {
        console.error('Error sending prescription:', error);
    }
}

module.exports = {
    sendPrescription,
};
