const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Load environment variables from .env file
require('dotenv').config();

const uri = process.env.MONGODB_URI;

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST'
            },
            body: 'Method Not Allowed',
        };
    }

    let email, password;
    try {
        const requestBody = JSON.parse(event.body);
        email = requestBody.email;
        password = requestBody.password;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Invalid JSON format' }),
        };
    }

    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db('test');
        const collection = db.collection('users');

        const user = await collection.findOne({ email: email.trim() });

        if (!user) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Login successful' }),
        };
    } catch (error) {
        console.error('Error during login:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Error logging in', error: error.message }),
        };
    }
};
