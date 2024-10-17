const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const loginController = require('../controllers/loginController');
const finalesController = require('../controllers/finalesController');

// Define las rutas y los controladores
router.post('/login', loginController.login);
router.get('/cursadas/:permiso/:carrera', Controllers.consultaCursadaPorAlumnoYCarrera);
router.get('/finales/:permiso/:carrera', finalesController.consultaFinalesPorAlumnosYCarrera);
router.put('/delete-inscription', finalesController.deleteInscription);
router.post('/inscribirfinal/', finalesController.inscribirAlumnosPorId);


module.exports = router;
