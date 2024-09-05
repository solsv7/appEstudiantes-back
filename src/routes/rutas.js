const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const loginController = require('../controllers/loginController');

// Define las rutas y los controladores
router.post('/', loginController.login);
router.get('/:permiso/:carrera', Controllers.consultaCursadaPor2Id);
router.post('/', Controllers.agregarParametro);

module.exports = router;
