const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '88Rounds',
    database : 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(database.users);
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  db.select('email', 'hash').from('login')
  .where( 'email', '=', email)
    .then(signInData => {
      const isValid = bcrypt.compareSync(password, signInData[0].hash)
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(error => res.status(400).json('Unable to get user'));
      } else {
        res.status(400).json('Invalid credentials');
      }
    })
    .catch(error => res.status(400).json('Invalid credentials'));
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx.insert({ hash, email })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0])
          })
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .catch(error => res.status(400).json('Unable to register'));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);        
      } else {
        res.status(404).json('User not found')
      }
    })
    .catch(error => { res.status(400).json('Error getting user') });
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    if (entries.length) {
        res.json(entries[0]);        
    } else {
      res.status(404).json('User not found')
    }
  })
  .catch(error => { res.status(400).json('Error getting entries') });
});

app.listen(3000, () => {
  console.log('App is running on port 3000');
});
