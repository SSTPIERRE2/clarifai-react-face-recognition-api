const handleImage = (req, res, db) => {
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
};

module.exports = { handleImage };