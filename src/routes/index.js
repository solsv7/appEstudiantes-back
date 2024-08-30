const express = require('express');
const router = express.Router();

// Importa rutas específicas
const rutas = require('./rutas');

// Usa las rutas específicas
router.use('/login', rutas);
router.use('/consulta', rutas);
router.use('/agregarParametro', rutas);


module.exports = router;
