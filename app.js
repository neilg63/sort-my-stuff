const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');


app.use(bodyParser.json());

let template = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
app.get('/', (req, res) => {
  res.send(template);
});

routes(app);

module.exports = app;