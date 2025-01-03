const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;

exports.handler = async function(event, context) {
    console.log('Event:', event); // Log the event object
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
        console.log('Parsed request body:', requestBody); // Log the parsed request body
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
        console.log('Connected to MongoDB');

        const db = client.db('test');
        const collection = db.collection('users');

        const user = await collection.findOne({ email: email.trim() });
        console.log('User found:', user); // Log the user found
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
        console.log('Password match:', isMatch); // Log the password match result
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
