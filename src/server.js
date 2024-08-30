const express = require('express');
const { connect } = require('./db');
const routes = require('./routes'); // Importa las rutas organizadas

const app = express();
const port = 3000;

app.use(express.json());

app.use('/api', routes); // Usa el router principal

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
