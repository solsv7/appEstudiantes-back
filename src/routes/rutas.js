const express = require('express');
const router = express.Router();
const Controllers = require('../controllers/controllers');
const loginController = require('../controllers/loginController');
const finalesController = require('../controllers/finalesController');
const updateUserInfo = require("../controllers/updtUserInfoController");
const matriculation = require ("../controllers/matriculation")

// Define las rutas y los controladores
router.post('/login', loginController.login);
router.get('/cursadas/:permiso/:carrera', Controllers.consultaCursadaPorAlumnoYCarrera);
router.get('/finales/:permiso/:carrera', finalesController.consultaFinalesPorAlumnosYCarrera);
router.put('/delete-inscription', finalesController.deleteInscription);
router.put('/changePassword', updateUserInfo.changePassword)
router.put('/changeUserInfo/:permiso', updateUserInfo.changeUserInfo)
router.post('/inscribirfinal/', finalesController.inscribirAlumnosPorId);
router.delete('/eliminarMatriculacion/', matriculation.eliminarMatriculacion);



module.exports = router;
