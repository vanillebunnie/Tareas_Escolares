{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww16380\viewh19080\viewkind0
\deftab560
\pard\pardeftab560\slleading20\partightenfactor0

\f0\fs26 \cf0 CREATE TABLE usuarios(\
id_usuario SERIAL PRIMARY KEY,\
nombre VARCHAR(100) NOT NULL,\
correo VARCHAR(100) UNIQUE NOT NULL,\
password VARCHAR(255) NOT NULL,\
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
);\
\
CREATE TABLE periodos(\
id_periodo SERIAL PRIMARY KEY,\
nombre VARCHAR(100) NOT NULL,\
fecha_inicio DATE NOT NULL,\
fecha_fin DATE NOT NULL,\
id_usuario INT NOT NULL,\
CONSTRAINT fk_periodo_usuario\
FOREIGN KEY (id_usuario)\
REFERENCES usuarios(id_usuario)\
ON DELETE CASCADE\
);\
\
CREATE TABLE materias(\
id_materia SERIAL PRIMARY KEY,\
nombre VARCHAR(100) NOT NULL,\
profesor VARCHAR(100),\
id_periodo INT NOT NULL,\
CONSTRAINT fk_materia_periodo\
FOREIGN KEY (id_periodo)\
REFERENCES periodos(id_periodo)\
ON DELETE CASCADE\
);\
\
CREATE TABLE horarios (\
id_horario SERIAL PRIMARY KEY,\
dia_semana CHAR(3) NOT NULL,\
hora_inicio TIME NOT NULL,\
hora_fin TIME NOT NULL,\
id_materia INT NOT NULL,\
CONSTRAINT chk_dia_semana\
CHECK (dia_semana IN('Lun', 'Mar', 'Mie', 'Jue', 'Vie')),\
CONSTRAINT fk_horario_materia\
FOREIGN KEY (id_materia)\
REFERENCES materias(id_materia)\
ON DELETE CASCADE\
);\
\
CREATE TABLE tareas (\
id_tarea SERIAL PRIMARY KEY,\
titulo VARCHAR(150) NOT NULL,\
descripcion TEXT,\
fecha_entrega DATE NOT NULL,\
completada BOOLEAN DEFAULT FALSE,\
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
id_materia INT NOT NULL,\
CONSTRAINT fk_tarea_materia\
FOREIGN KEY (id_materia)\
REFERENCES materias(id_materia)\
ON DELETE CASCADE\
);\
  }