const { pool } = require('../config/database');

module.exports={
    loginc:async(email)=>{
        
    },
    emailexist:async(email)=>{
        
    },
    signupc:async(email)=>{
        const queryText = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(queryText, [email]);
        return result.rows;
    },
    insert:async(data)=>{
        try {
            const queryText = `
                INSERT INTO users (name, email, password, subscription, isActive)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const values = [
                data.name,
                data.email,
                data.password,
                data.subscription,
                data.isActive
            ];
            const result = await pool.query(queryText, values);
            console.log('Data inserted successfully:', result);
        } catch (error) {
            console.error('Error inserting data:', error);
            throw error;
        }
    },
}