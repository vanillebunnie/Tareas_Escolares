const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/horarios.controller');

/* ENDPOINTS
http://localhost:3000/api/horarios/               método POST:      nuevo horario
http://localhost:3000/api/horarios/materia/id     método GET:       consultar horarios de una materia
http://localhost:3000/api/horarios/               método GET:       consultar todos los horarios
http://localhost:3000/api/horarios/id             método PUT:       actualizar un horario por id
http://localhost:3000/api/horarios/id             método DELETE:    eliminar horario
*/

// Crear un nuevo horario
router.post('/', verificarToken, controller.crearHorario);

// Consultar el horario de una materia en particular, con el id de la materia
router.get('/materia/:id_materia', verificarToken, controller.obtenerHorariosPorMateria);

// Consultar todos los horarios
router.get('/', verificarToken, controller.obtenerHorarioCompleto);

// Actualizar un horario por id
router.put('/:id', verificarToken, controller.actualizarHorario);

// Eliminar un horario por id
router.delete('/:id', verificarToken, controller.eliminarHorario);

module.exports = router;
