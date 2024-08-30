const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');

// Define las rutas y los controladores
router.post('/', Controllers.login);
router.get('/:permiso/:carrera', Controllers.consultaCursadaPor2Id);
router.post('/', Controllers.agregarParametro);

module.exports = router;
