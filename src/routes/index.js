const express = require('express');
const router = express.Router();

// Importa rutas específicas
const rutas = require('./rutas');

// Usa las rutas específicas
router.use('/session', rutas);


module.exports = router;
