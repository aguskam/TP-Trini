const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1', 
    user: 'root', 
    password: '',     
    database: 'escuela',
    port: 3306, 
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
    if (err) {
        console.error('error db:', err.stack);
        console.log(' error: revisa mysql en xampp.');
        return;
    }
    console.log(`conexión a "${dbConfig.database}" exitosa.`);
});

// obtener cursos
app.get('/cursos', (req, res) => {
    db.query('SELECT * FROM cursos ORDER BY id', (err, results) => {
        if (err) return res.status(500).json({ message: 'error al obtener cursos.' });
        res.json(results);
    });
});

app.get('/materias/:cursoId', (req, res) => {
    const { cursoId } = req.params;
    const sql = `
        SELECT m.id, m.nombre
        FROM materias m
        JOIN curso_materia cm ON m.id = cm.materia_id
        WHERE cm.curso_id = ?
        ORDER BY m.nombre`;
    db.query(sql, [cursoId], (err, results) => {
        if (err) return res.status(500).json({ message: 'error al obtener materias.' });
        res.json(results);
    });
});


app.get('/alumnos/:cursoId', (req, res) => {
    const { cursoId } = req.params;
    const sql = 'SELECT id, nombre, apellido FROM alumnos WHERE curso_id = ? ORDER BY apellido';
    db.query(sql, [cursoId], (err, results) => {
        if (err) return res.status(500).json({ message: 'error al obtener alumnos.' });
        res.json(results);
    });
});

// obtener asistencia más reciente de un alumno para una materia
app.get('/asistencia_reciente/:alumnoId/:cursoId/:materiaId', (req, res) => {
    const { alumnoId, cursoId, materiaId } = req.params;
    const sql = `
        SELECT estado 
        FROM asistencia 
        WHERE alumno_id = ? AND curso_id = ? AND materia_id = ?
        ORDER BY fecha DESC LIMIT 1`;
    db.query(sql, [alumnoId, cursoId, materiaId], (err, results) => {
        if (err) return res.status(500).json({ message: 'error al obtener asistencia reciente.' });
        if (results.length === 0) return res.json({});
        res.json(results[0]);
    });
});

// registrar asistencia
app.post('/registro', (req, res) => {
    const { alumno_id, curso_id, estado, materia_id } = req.body;
    
    const estadosValidos = ['P', 'A', 'T', 'RA', 'AP']; // <<-- VALIDACIÓN ACTUALIZADA
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: `estado inválido: ${estado}.` });
    }

    if (!alumno_id || !curso_id || !materia_id || !estado) {
        return res.status(400).json({ message: 'faltan campos requeridos.' });
    }

    const sql = 'INSERT INTO asistencia (alumno_id, curso_id, materia_id, estado) VALUES (?, ?, ?, ?)';
    db.query(sql, [alumno_id, curso_id, materia_id, estado], (err, result) => {
        if (err) {
            console.error('error al registrar asistencia:', err);
            return res.status(500).json({ message: 'error al insertar registro en la bd.' });
        }
        res.status(201).json({ message: 'registro de asistencia exitoso.', id: result.insertId });
    });
});

// obtener historial (filtrado por fecha)
app.get('/historial', (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    let sql = `
        SELECT 
            a.id AS registro_id,
            a.fecha,
            DATE_FORMAT(a.fecha, '%d/%m/%Y %H:%i') AS fecha_formato,
            a.estado,
            al.nombre AS alumno_nombre,
            al.apellido AS alumno_apellido,
            c.nombre AS curso_nombre,
            m.nombre AS materia_nombre
        FROM asistencia a
        JOIN alumnos al ON a.alumno_id = al.id
        JOIN cursos c ON a.curso_id = c.id
        JOIN materias m ON a.materia_id = m.id
    `;
    let params = [];

    if (fecha_inicio && fecha_fin) {
        sql += ' WHERE DATE(a.fecha) BETWEEN ? AND ?';
        params = [fecha_inicio, fecha_fin];
    }
    
    sql += ' ORDER BY a.fecha DESC';

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'error al obtener historial.' });
        res.json(results);
    });
});



// EDITAR estado de un registro 
app.put('/registro/:id', (req, res) => {
    const registroId = req.params.id;
    const { estado } = req.body;
    
    const estadosValidos = ['P', 'A', 'T', 'RA', 'AP']; // <<-- VALIDACIÓN ACTUALIZADA
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: `estado inválido: ${estado}. Los estados válidos son ${estadosValidos.join(', ')}.` });
    }

    const sql = 'UPDATE asistencia SET estado = ?, fecha = CURRENT_TIMESTAMP WHERE id = ?';
    db.query(sql, [estado, registroId], (err, result) => {
        if (err) {
            console.error('Error al actualizar registro:', err);
            return res.status(500).json({ message: 'error al actualizar registro.' });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'registro no encontrado.' });
        res.json({ message: 'registro de asistencia actualizado con éxito.' });
    });
});

// ELIMINAR un registro
app.delete('/registro/:id', (req, res) => {
    const registroId = req.params.id;

    const sql = 'DELETE FROM asistencia WHERE id = ?';
    db.query(sql, [registroId], (err, result) => {
        if (err) {
            console.error('Error al eliminar registro:', err);
            return res.status(500).json({ message: 'error al eliminar registro.' });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'registro no encontrado.' });
        res.json({ message: 'registro de asistencia eliminado con éxito.' });
    });
});


// agregar nuevo alumno
app.post('/alumno', (req, res) => {
    const { nombre, apellido, curso_id } = req.body;
    
    if (!nombre || !apellido || !curso_id) {
        return res.status(400).json({ message: 'faltan campos: nombre, apellido o curso_id.' });
    }

    const sql = 'INSERT INTO alumnos (nombre, apellido, curso_id) VALUES (?, ?, ?)';
    db.query(sql, [nombre, apellido, curso_id], (err, result) => {
        if (err) {
            console.error('error al agregar alumno:', err);
            return res.status(500).json({ message: 'error al insertar el nuevo alumno en la bd.' });
        }
        res.status(201).json({ message: 'alumno agregado con éxito.', id: result.insertId });
    });
});

app.listen(PORT, () => {
    console.log(`servidor corriendo en http://localhost:${PORT}`);

});
