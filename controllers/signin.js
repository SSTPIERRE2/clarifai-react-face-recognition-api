const handleSignIn = (db, bcrypt) => (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }

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
};

module.exports = { handleSignIn };