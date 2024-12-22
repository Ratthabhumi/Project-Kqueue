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

        const user = await collection.findOne({ email: email.trim() });

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error logging in', error: error.message }),
        };
    }
};
