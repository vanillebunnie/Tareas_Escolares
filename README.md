# Proyecto "Tareas escolares"

> Este proyecto es un proyecto universitario para practicar la creación de APIs usando la tecnología Node.js y Express.

---

## ✿ Configuración del backend ✿

Se detallan a continuación las librerías utilizadas como dependencias del sistema, junto con sus versiones.

| Herramienta / Librería | Versión | Descripción |
| :--- | :--- | :--- |
| **express** | ^5.2.1 | Framework web para Node.js utilizado para crear el servidor y manejar las rutas. |
| **cors** | ^2.8.6 | Middleware para habilitar el intercambio de recursos de origen cruzado. |
| **dotenv** | ^17.3.1 | Módulo para cargar variables de entorno desde un archivo de configuración. |
| **jsonwebtoken** | ^9.0.3 | Librería utilizada para la autenticación y generación de tokens de seguridad. |
| **pg** | ^8.18.0 | Cliente de PostgreSQL para conectar la base de datos con la API. |
| **nodemon** | ^3.1.14 | Dependencia de desarrollo que reinicia automáticamente el servidor al detectar cambios. |

---

## ✿ Documentación de endpoints ✿

A continuación se presenta la lista detallada de los endpoints creados en la API, organizados por sección.

### Autenticación
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Registrar un nuevo usuario. |
| `/api/auth/login` | POST | Iniciar sesión en el sistema. |

### Periodos escolares
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/periodos/` | POST | Crear un nuevo periodo. |
| `/api/periodos/` | GET | Listar todos los periodos del usuario. |
| `/api/periodos/:id` | GET | Obtener un periodo específico mediante su ID. |
| `/api/periodos/:id` | PUT | Actualizar la información de un periodo. |
| `/api/periodos/:id` | DELETE | Eliminar un periodo del sistema. |

### Materias
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/materias/` | POST | Crear una nueva materia. |
| `/api/materias/` | GET | Listar todas las materias registradas. |
| `/api/materias/:id_periodo` | GET | Listar materias filtradas por el ID de un periodo específico. |
| `/api/materias/detalle/:id` | GET | Obtener el detalle de una materia mediante su ID. |
| `/api/materias/:id` | PUT | Actualizar la información de una materia. |
| `/api/materias/:id` | DELETE | Eliminar una materia del sistema. |

### Horarios
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/horarios/` | POST | Crear un nuevo horario. |
| `/api/horarios/` | GET | Consultar todos los horarios registrados en el sistema. |
| `/api/horarios/materia/:id_materia` | GET | Consultar el horario de una materia en particular usando su ID. |
| `/api/horarios/:id` | PUT | Actualizar un horario específico por su ID. |
| `/api/horarios/:id` | DELETE | Eliminar un horario por su ID. |

### Tareas
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/tareas/` | POST | Crear una nueva tarea. |
| `/api/tareas/` | GET | Listar todas las tareas registradas. |
| `/api/tareas/:id` | GET | Listar una tarea específica según su ID. |
| `/api/tareas/estado/pendientes` | GET | Filtrar y listar todas las tareas en estado pendiente. |
| `/api/tareas/estado/vencidas` | GET | Filtrar y listar todas las tareas en estado vencido. |
| `/api/tareas/estado/completadas` | GET | Filtrar y listar todas las tareas completadas. |
| `/api/tareas/:id` | PUT | Actualizar los datos de una tarea. |
| `/api/tareas/:id/completar` | PATCH | Cambiar el estado de una tarea para marcarla como completada. |
| `/api/tareas/:id` | DELETE | Borrar una tarea del sistema. |

---

**Desarrolladora:** Victoria Piña Poot ໒꒰ྀི´  ˘  `  ꒱ྀིა  
**Universidad Politécnica de Bacalar**  
**Fecha:** 12 de marzo de 2026