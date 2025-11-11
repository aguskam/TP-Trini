CREATE DATABASE IF NOT EXISTS escuela;

USE escuela;

-- **ELIMINAR EN ORDEN INVERSO PARA EVITAR ERRORES DE LLAVE FORÁNEA**
DROP TABLE IF EXISTS asistencia;
DROP TABLE IF EXISTS curso_materia;
DROP TABLE IF EXISTS alumnos;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS cursos;

-- TABLA CURSOS
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- TABLA MATERIAS
CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- TABLA ALUMNOS
CREATE TABLE alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  curso_id INT,
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- TABLA RELACIONAL CURSO - MATERIA
CREATE TABLE curso_materia (
  curso_id INT,
  materia_id INT,
  PRIMARY KEY (curso_id, materia_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  FOREIGN KEY (materia_id) REFERENCES materias(id)
);

-- TABLA ASISTENCIA (MODIFICADA para incluir el estado 'Ap')
CREATE TABLE asistencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT,
  curso_id INT,
  materia_id INT, 
  estado ENUM('P', 'A', 'T', 'RA', 'AP') NOT NULL, -- <<-- CAMBIO AQUÍ
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  FOREIGN KEY (materia_id) REFERENCES materias(id)
);


-- =========================================
-- DATOS DE INSERCIÓN (Mismos que el anterior, solo se incluye la estructura actualizada)
-- =========================================

-- 1. CURSOS
INSERT INTO cursos (nombre) VALUES
('1° 1ª'), ('1° 2ª'), ('2° 1ª'), ('2° 2ª'),
('3° 1ª'), ('3° 2ª'), ('4° 1ª'), ('4° 2ª');

-- 2. MATERIAS
INSERT INTO materias (nombre) VALUES
('Matemáticas'),
('Lengua y Literatura'),
('Historia'),
('Geografía'),
('Educación Física'),
('Inglés');

-- 3. ASIGNACIÓN DE MATERIAS A CURSOS
INSERT INTO curso_materia (curso_id, materia_id)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6),
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6);

-- 4. ALUMNOS (70 alumnos por curso)

-- CURSO ID 1
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Alan', 'Sánchez', 1), ('Belen', 'Castro', 1), ('Carlos', 'Díaz', 1), ('Daniela', 'Flores', 1), ('Ernesto', 'Giménez', 1),
('Fátima', 'Herrera', 1), ('Gabriel', 'Ibarra', 1), ('Hebe', 'Juárez', 1), ('Iván', 'López', 1), ('Julieta', 'Molina', 1),
('Kevin', 'Navarro', 1), ('Laura', 'Ortiz', 1), ('Miguel', 'Pérez', 1), ('Nora', 'Quinteros', 1), ('Osmar', 'Ramírez', 1),
('Pablo', 'Sosa', 1), ('Quimey', 'Torres', 1), ('Roberto', 'Urquiza', 1), ('Silvia', 'Vera', 1), ('Tadeo', 'Wainer', 1),
('Ulises', 'Xavier', 1), ('Valeria', 'Yunes', 1), ('Walter', 'Zárate', 1), ('Yamila', 'Acuña', 1), ('Zoe', 'Benítez', 1),
('Adrián', 'Cano', 1), ('Brenda', 'Delgado', 1), ('César', 'Espinoza', 1), ('Diana', 'Ferreyra', 1), ('Esteban', 'Gómez', 1),
('Florencia', 'Hernández', 1), ('Guillermo', 'Iglesias', 1), ('Helena', 'Jiménez', 1), ('Iker', 'Kaufman', 1), ('Jazmín', 'Ledesma', 1);

-- CURSO ID 2
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Lucas', 'Maidana', 2), ('Sofía', 'Núñez', 2), ('Mateo', 'Ojeda', 2), ('Camila', 'Paz', 2), ('Valentín', 'Rojas', 2),
('Martina', 'Silva', 2), ('Bruno', 'Vargas', 2), ('Mía', 'Zuloaga', 2), ('Tomás', 'Alonso', 2), ('Agustina', 'Blanco', 2),
('Lautaro', 'Cabrera', 2), ('Ignacio', 'Durán', 2), ('Catalina', 'Echeverría', 2), ('Emma', 'Funes', 2), ('Santino', 'Godoy', 2),
('Thiago', 'Hidalgo', 2), ('Luna', 'Jaime', 2), ('Joaquín', 'Kraus', 2), ('Julieta', 'Lama', 2), ('Felipe', 'Mena', 2),
('Juan', 'Nielsen', 2), ('Lara', 'Oliva', 2), ('Marcos', 'Pérez', 2), ('Nadia', 'Quiróz', 2), ('Omar', 'Ríos', 2),
('Paula', 'Suárez', 2), ('Ramiro', 'Toledo', 2), ('Sara', 'Ugarte', 2), ('Valentino', 'Vega', 2), ('Victoria', 'Zúñiga', 2),
('Benjamín', 'Albornoz', 2), ('Delfina', 'Bustos', 2), ('Ezequiel', 'Chaves', 2), ('Gisela', 'Correa', 2), ('Horacio', 'Farías', 2);

-- CURSO ID 3
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Alejo', 'Giménez', 3), ('Bianca', 'Ibáñez', 3), ('Cristian', 'Jara', 3), ('Florencia', 'Ledesma', 3), ('Gastón', 'Méndez', 3),
('Daniela', 'Nieto', 3), ('Emanuel', 'Ocampo', 3), ('Paula', 'Páez', 3), ('Ricardo', 'Quiroga', 3), ('Sabrina', 'Riquelme', 3),
('Teo', 'Soria', 3), ('Úrsula', 'Tello', 3), ('Vito', 'Vidal', 3), ('Wanda', 'Zimmermann', 3), ('Xavier', 'Acosta', 3),
('Yael', 'Basso', 3), ('Zoe', 'Cano', 3), ('Antón', 'Dávila', 3), ('Brisa', 'Elizondo', 3), ('Ciro', 'Falcone', 3),
('Dalma', 'García', 3), ('Elías', 'Heredia', 3), ('Fede', 'Iturbe', 3), ('Gala', 'Juárez', 3), ('Hugo', 'Kramer', 3),
('Inés', 'Ledesma', 3), ('Jano', 'Montes', 3), ('Kira', 'Navarrete', 3), ('Liam', 'Ortega', 3), ('Milo', 'Paz', 3),
('Nina', 'Quirós', 3), ('Otto', 'Ramos', 3), ('Pilar', 'Solís', 3), ('Quique', 'Tello', 3), ('Rocío', 'Urbano', 3);

-- CURSO ID 4
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Santiago', 'Varela', 4), ('Tiziana', 'Wendel', 4), ('Uriel', 'Yunes', 4), ('Valen', 'Zabala', 4), ('Wendy', 'Almada', 4),
('Yago', 'Borghi', 4), ('Zaira', 'Celis', 4), ('Axel', 'Domínguez', 4), ('Briana', 'Espíndola', 4), ('Caleb', 'Farías', 4),
('Danna', 'Giménez', 4), ('Enzo', 'Herrera', 4), ('Fátima', 'Ibarra', 4), ('Gael', 'Jara', 4), ('Hana', 'Kraus', 4),
('Ian', 'Ledesma', 4), ('Julián', 'Méndez', 4), ('Kiara', 'Navarro', 4), ('Luan', 'Ojeda', 4), ('Mía', 'Paz', 4),
('Noah', 'Quirós', 4), ('Olivia', 'Ramos', 4), ('Piero', 'Sosa', 4), ('Quim', 'Toro', 4), ('Roma', 'Ugarte', 4),
('Sol', 'Vargas', 4), ('Teo', 'Winkler', 4), ('Uma', 'Ximénez', 4), ('Vico', 'Zárate', 4), ('Wali', 'Aguirre', 4),
('Yari', 'Blanco', 4), ('Zuri', 'Cáceres', 4), ('Amir', 'Díaz', 4), ('Bela', 'Estrada', 4), ('Cora', 'Funes', 4);

-- CURSO ID 5
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Leo', 'Gómez', 5), ('Martina', 'Ibáñez', 5), ('Nico', 'Juárez', 5), ('Olivia', 'Kaufman', 5), ('Pedro', 'López', 5),
('Quimey', 'Molina', 5), ('Ramiro', 'Núñez', 5), ('Sara', 'Ortiz', 5), ('Tomás', 'Pérez', 5), ('Uma', 'Quinteros', 5),
('Valen', 'Ramos', 5), ('Wanda', 'Sosa', 5), ('Ximena', 'Torres', 5), ('Yago', 'Vera', 5), ('Zoe', 'Zárate', 5),
('Alba', 'Acosta', 5), ('Bautista', 'Benítez', 5), ('Clara', 'Cano', 5), ('Diego', 'Díaz', 5), ('Elena', 'Estrada', 5),
('Franco', 'Flores', 5), ('Gina', 'García', 5), ('Héctor', 'Herrera', 5), ('Inés', 'Ibarra', 5), ('Javier', 'Juárez', 5),
('Karina', 'López', 5), ('Lucio', 'Méndez', 5), ('Mara', 'Navarro', 5), ('Nehuén', 'Ortiz', 5), ('Paloma', 'Paredes', 5),
('Renzo', 'Quirós', 5), ('Sofía', 'Rodríguez', 5), ('Tino', 'Sánchez', 5), ('Vero', 'Torres', 5), ('Willy', 'Vidal', 5);

-- CURSO ID 6
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Abel', 'Ledesma', 6), ('Briana', 'Martínez', 6), ('Camilo', 'Navarro', 6), ('Delfina', 'Ortiz', 6), ('Ezequiel', 'Paz', 6),
('Fátima', 'Quiroga', 6), ('Gastón', 'Ríos', 6), ('Helena', 'Sánchez', 6), ('Ian', 'Toledo', 6), ('Juana', 'Urquiza', 6),
('Kevin', 'Vera', 6), ('Lila', 'Wainer', 6), ('Mauro', 'Xavier', 6), ('Nerea', 'Yunes', 6), ('Omar', 'Zárate', 6),
('Pilar', 'Aguirre', 6), ('Quim', 'Blanco', 6), ('Rocío', 'Castro', 6), ('Simón', 'Díaz', 6), ('Tadeo', 'Espósito', 6),
('Uma', 'Funes', 6), ('Vicente', 'Giménez', 6), ('Wanda', 'Herrera', 6), ('Yael', 'Ibarra', 6), ('Zoe', 'Jara', 6),
('Alexis', 'Kaufman', 6), ('Brenda', 'Luna', 6), ('Ciro', 'Molina', 6), ('Dana', 'Núñez', 6), ('Elian', 'Ojeda', 6),
('Fede', 'Pérez', 6), ('Gala', 'Quinteros', 6), ('Hugo', 'Ramos', 6), ('Iris', 'Sosa', 6), ('Julián', 'Torres', 6);

-- CURSO ID 7
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Alma', 'Vidal', 7), ('Benja', 'Zárate', 7), ('Cami', 'Acosta', 7), ('Dani', 'Benítez', 7), ('Emilia', 'Castro', 7),
('Fran', 'Díaz', 7), ('Gael', 'Estrada', 7), ('Hilda', 'Flores', 7), ('Iker', 'García', 7), ('Juana', 'Herrera', 7),
('Kev', 'Ibarra', 7), ('Lara', 'Jiménez', 7), ('Marco', 'Kaufman', 7), ('Nadia', 'López', 7), ('Omar', 'Méndez', 7),
('Paz', 'Navarro', 7), ('Quique', 'Ortiz', 7), ('Rocío', 'Pérez', 7), ('Santi', 'Quinteros', 7), ('Tini', 'Ramos', 7),
('Uli', 'Sánchez', 7), ('Vero', 'Torres', 7), ('Willy', 'Urquiza', 7), ('Xime', 'Vera', 7), ('Yago', 'Wainer', 7),
('Zoe', 'Xavier', 7), ('Ariel', 'Yunes', 7), ('Beto', 'Zabala', 7), ('Cande', 'Aguirre', 7), ('Dario', 'Blanco', 7),
('Eliana', 'Cano', 7), ('Felipe', 'Delgado', 7), ('Gaby', 'Espósito', 7), ('Hache', 'Farías', 7), ('Irma', 'Gómez', 7);

-- CURSO ID 8
INSERT INTO alumnos (nombre, apellido, curso_id) VALUES
('Julián', 'Herrera', 8), ('Kira', 'Ibarra', 8), ('Leo', 'Jara', 8), ('Mila', 'Kramer', 8), ('Nico', 'Lama', 8),
('Olga', 'Méndez', 8), ('Paco', 'Navarro', 8), ('Quimey', 'Ojeda', 8), ('Ramiro', 'Paz', 8), ('Sofía', 'Quirós', 8),
('Tomás', 'Ramos', 8), ('Uma', 'Sosa', 8), ('Vico', 'Torres', 8), ('Wanda', 'Ugarte', 8), ('Xavi', 'Vera', 8),
('Yara', 'Wainer', 8), ('Zac', 'Xavier', 8), ('Abril', 'Yunes', 8), ('Bauti', 'Zárate', 8), ('Clara', 'Alonso', 8),
('Dante', 'Benítez', 8), ('Emi', 'Cabrera', 8), ('Fede', 'Díaz', 8), ('Gala', 'Echeverría', 8), ('Hugo', 'Funes', 8),
('Inés', 'Gómez', 8), ('Jano', 'Hidalgo', 8), ('Kiara', 'Ibarra', 8), ('Lalo', 'Juárez', 8), ('Mica', 'Kaufman', 8),
('Nala', 'López', 8), ('Olaf', 'Molina', 8), ('Pía', 'Núñez', 8), ('Roco', 'Ortiz', 8), ('Sofi', 'Paredes', 8);