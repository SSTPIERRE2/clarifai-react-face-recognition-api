const jwt = require('jsonwebtoken');
const redis = require('redis');

//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const getUserByCredentials = (db, bcrypt, req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }

  return db.select('email', 'hash').from('login')
    .where( 'email', '=', email)
      .then(signInData => {
        const isValid = bcrypt.compareSync(password, signInData[0].hash)
        if (isValid) {
          return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => user[0])
            .catch(() => Promise.reject('Unable to get user'));
        } else {
          Promise.reject('Invalid credentials');
        }
      })
      .catch(() => Promise.reject('Invalid credentials'));
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers
  redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json('Unauthorized')
    }
    return res.json({ id: reply })
  })
}

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days' });
}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value))
}

const createSessions = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => ({ success: 'true', userId: id, token }))
    .catch(console.log)
}

const signInAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization 
    ? getAuthTokenId(req, res) 
    : getUserByCredentials(db, bcrypt, req)
      .then(data => {
        console.log(`got user credentials`, data);
        return data.id && data.email ? createSessions(data) : Promise.reject(data);
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err));
}

module.exports = { 
  signInAuthentication,
  redisClient
};