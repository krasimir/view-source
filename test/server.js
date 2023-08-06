const express = require('express');
const { viewSource } = require('../index');

const app = express();

viewSource({
  app,
  route: '/code',
  source: __dirname + '/../'
});

app.get('*', (req, res) => {
  res.send('view-source');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});