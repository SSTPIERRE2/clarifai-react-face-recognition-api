const redis = require('redis');

//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const signOutUser = (req, res) => {
    const { authorization } = req.headers;
    console.log(`signOutUser`, req.headers, authorization);
    redisClient.del(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json('Unauthorized')
        }
        return res.json('Successfully signed out')
    });
}

module.exports = {
    signOutUser
}