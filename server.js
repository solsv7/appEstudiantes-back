const express = require('express');
const { connect } = require('./src/db');
const routes = require('./src/routes'); // Importa las rutas organizadas
const cors = require('cors');


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/api', routes); // Usa el router principal

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
