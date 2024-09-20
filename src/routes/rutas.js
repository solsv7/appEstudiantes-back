const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const loginController = require('../controllers/loginController');

// Define las rutas y los controladores
router.post('/login', loginController.login);
router.get('/cursadas/:permiso/:carrera', Controllers.consultaCursadaPorAlumnoYCarrera);
router.get('/finales/:permiso/:carrera', Controllers.consultaFinalesPorAlumnosYCarrera);


module.exports = router;
