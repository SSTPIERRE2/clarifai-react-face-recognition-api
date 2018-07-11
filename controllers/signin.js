const handleSignIn = (req, res, db, bcrypt) => {
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
};

module.exports = { handleSignIn };