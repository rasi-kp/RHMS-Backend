# RHMS Hospital Management System Backend

project live in [rhms.online](https://rhms.online)

Welcome to the RHMS (Hospital Management System) Backend repository. This repository contains the backend services for the RHMS project, developed using modern web technologies to manage various hospital operations efficiently.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The RHMS Backend provides the necessary APIs and database management functionalities required to support the RHMS application. It handles patient records, appointments, staff management, medical records, and billing information, ensuring a smooth and efficient workflow for hospital management.

## Features

- **Patient Management**: CRUD operations for patient records.
- **Appointment Scheduling**: Manage and schedule patient appointments.
- **Medical Records**: Store and retrieve patient medical records.
- **Billing**: Handle billing and invoicing for hospital services.
- **Authentication**: Secure login and user management.
- **Role-Based Access Control**: Restrict access based on user roles.

## Technologies Used

- **Programming Language**: Node.js
- **Framework**: Express.js
- **Database**: PostgreeSql
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Google Doc

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rasi-kp/RHMS-Backend.git
   cd rhms-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/rhms
   JWT_SECRET=your_jwt_secret
   ADMIN_JWT_SECRET=admin-secret-key
   DOCTOR_JWT_SECRET=doctor-secret-key
   TWILIO_ACCOUNT_SID=***********
   TWILIO_AUTH_TOKEN=***********
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Configuration

- **Database**: Ensure PostgreeSql is installed and running. Update the `DATABASE_URL` in the `.env` file with your PostgreeSql connection.
- **JWT Secret**: Update the `JWT_SECRET` in the `.env` file with a secure secret key for JWT authentication.

## Usage

- **Running in Development**:
  ```bash
  npm run dev
  ```

- **Running in Production**:
  ```bash
  npm start
  ```

## API Documentation

API documentation is available and can be accessed at `http://localhost:3000/api-docs` once the server is running. .

## Contributing

We welcome contributions to the RHMS Backend. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add your feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a Pull Request.


## Contact

For any inquiries or issues, please contact the project maintainer at [rasir239@gmail.com](mailto:rasir239@gmail.com) or [rasikp.online](https://rasikp.online).
