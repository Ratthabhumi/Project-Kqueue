const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const { email, password } = JSON.parse(event.body);

    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db('test');
        const collection = db.collection('users');

        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        await collection.insertOne({ email: email.trim(), password: hashedPassword });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Registration successful' }),
        };
    } catch (error) {
        if (error.code === 11000) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email is already registered' }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error registering new user', error: error.message }),
        };
    }
};
