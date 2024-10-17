const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const loginController = require('../controllers/loginController');
const inscriptionController = require('../controllers/inscriptionController');

// Define las rutas y los controladores
router.post('/login', loginController.login);
router.get('/cursadas/:permiso/:carrera', Controllers.consultaCursadaPorAlumnoYCarrera);
router.get('/finales/:permiso/:carrera', Controllers.consultaFinalesPorAlumnosYCarrera);
router.put('/delete-inscription', inscriptionController.deleteInscription);
router.post('/inscribirfinal/', Controllers.inscribirAlumnosPorId);


module.exports = router;
