const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/tareas.controller');

/* ENDPOINTS
http://localhost:3000/api/tareas/               método POST:    nueva tarea
http://localhost:3000/api/tareas/               método GET:     listar todas las tareas
http://localhost:3000/api/tareas/id             método GET:     listar una tarea
http://localhost:3000/api/tareas/id             método PUT:     actualizar tarea
http://localhost:3000/api/tareas/id/completar   método PATCH:   cambiar estado
http://localhost:3000/api/tareas/id             método DELETE:  borrar tarea
http://localhost:3000/api/tareas/estado/pendientes      método GET
http://localhost:3000/api/tareas/estado/vencidas        método GET
http://localhost:3000/api/tareas/estado/completadas     método GET
*/

// Crear una nueva tarea
router.post('/', verificarToken, controller.crearTarea);

// Consultar todas las tareas
router.get('/', verificarToken, controller.obtenerTodasLasTareas);

// Consultar una tarea según su ID
router.get('/:id', verificarToken, controller.obtenerTareaPorId);

// Actualizar una tarea
router.put('/:id', verificarToken, controller.actualizarTarea);

// Marcar como completada una tarea
router.patch('/:id/completar', verificarToken, controller.marcarComoCompletada);

// Eliminar una tarea por id
router.delete('/:id', verificarToken, controller.eliminarTarea);

// Endpoints adicionales
// Tareas pendientes
router.get('/estado/pendientes', verificarToken, controller.tareasPendientes);
// Tareas vencidas
router.get('/estado/vencidas', verificarToken, controller.tareasVencidas);
// Tareas completadas
router.get('/estado/completadas', verificarToken, controller.tareasCompletadas);

module.exports = router;
