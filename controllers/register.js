const { createSessions } = require("./signin");

const handleRegister = (db, bcrypt) => (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

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
          .then(users => {
            const user = users[0];

            return user && user.id && user.email ? createSessions(user) : Promise.reject('User not created')
          })
          .then(session => res.json(session))
          .catch(err => Promise.reject(err))
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .catch(error => {
    console.log(`error registering`, error);
    res.status(400).json('Unable to register')
  });
};

module.exports = { handleRegister };