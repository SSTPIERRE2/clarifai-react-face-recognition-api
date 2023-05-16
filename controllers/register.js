const handleRegister = (db, bcrypt) => (req, res) => {
  const { email, name, password } = req.body;

  console.log('handleRegister', email, name, password);

  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({ hash, email })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((error) => {
    console.log('Caught error while registering', error);
    res.status(400).json('Unable to register');
  });
};

module.exports = { handleRegister };
