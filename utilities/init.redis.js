const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
});

client.on('ready', () => {
    console.log('Redis ready');
});

client.on('error', (err) => {
    console.log(err.message);
});

client.on('end', () => {
    console.log('Redis disconnected');
});

process.on('SIGINT', () => {
    client.quit();
});

client.connect().then(() => {
    console.log('Redis connected');
}).catch((err) => {
    console.log(err.message);
});

module.exports = client;