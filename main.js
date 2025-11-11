const URL_BASE = 'http://localhost:3000'; 
const ESTADOS_VALIDOS = ['P', 'A', 'T', 'RA', 'AP']; // <<-- Array de estados para edición

// ====================================================================
// --- FUNCIONES GLOBALES ---
// ====================================================================

// 1. Carga de Cursos
async function cargarCursos() {
    const selectorCurso = document.getElementById('selectorCurso');
    const selectorCursoNuevo = document.getElementById('selectorCursoNuevo');
    
    try {
        const respuesta = await fetch(`${URL_BASE}/cursos`);
        const cursos = await respuesta.json(); 
        
        const opcionesCursos = cursos.map(curso => 
            `<option value="${curso.id}">${curso.nombre}</option>`
        ).join('');

        selectorCurso.innerHTML = '<option value="">-- SELECCIONE UN CURSO --</option>' + opcionesCursos;
        selectorCursoNuevo.innerHTML = '<option value="">-- SELECCIONE CURSO --</option>' + opcionesCursos;
        
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

// 2. Carga de Materias
async function cargarMaterias(cursoId) {
    const selectorMateria = document.getElementById('selectorMateria');
    selectorMateria.innerHTML = '<option value="">-- CARGANDO MATERIAS --</option>';
    selectorMateria.disabled = true;

    if (!cursoId) {
        selectorMateria.innerHTML = '<option value="">-- SELECCIONE CURSO PRIMERO --</option>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/materias/${cursoId}`);
        const materias = await respuesta.json();
        
        if (materias.length === 0) {
            selectorMateria.innerHTML = '<option value="">-- NO HAY MATERIAS ASIGNADAS --</option>';
        } else {
            const opcionesMaterias = materias.map(materia => 
                `<option value="${materia.id}">${materia.nombre}</option>`
            ).join('');
            selectorMateria.innerHTML = '<option value="">-- SELECCIONE UNA MATERIA --</option>' + opcionesMaterias;
            selectorMateria.disabled = false;
        }

    } catch (error) {
        console.error('Error al cargar materias:', error);
        selectorMateria.innerHTML = '<p>ERROR DE CONEXIÓN.</p>';
    }
}

// 3. Carga de Alumnos (Incluye el botón 'AP')
async function cargarAlumnos(cursoId, materiaId) {
    const listaAlumnos = document.getElementById('listaAlumnos');
    listaAlumnos.innerHTML = '<p>Cargando alumnos...</p>';

    if (!cursoId || !materiaId) {
        listaAlumnos.innerHTML = '<p>Selecciona un curso y una materia para cargar la lista de alumnos</p>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/alumnos/${cursoId}`);
        const alumnos = await respuesta.json();

        if (alumnos.length === 0) {
            listaAlumnos.innerHTML = '<p>No se encontraron alumnos para este curso.</p>';
            return;
        }

        let tablaHTML = `
            <table class="tablaAsistencia">
                <thead>
                    <tr>
                        <th>APELLIDO, NOMBRE</th>
                        <th>PRESENTE</th>
                        <th>AUSENTE</th>
                        <th>TARDE</th>
                        <th>RET. C/ AV.</th>
                        <th>ABS. JUST.</th> <th>ÚLTIMO REGISTRO</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const alumno of alumnos) {
            const resAsistencia = await fetch(`${URL_BASE}/asistencia_reciente/${alumno.id}/${cursoId}/${materiaId}`);
            const asistencias = await resAsistencia.json();
            const estadoReciente = asistencias.estado || 'N/A';
            
            const getClaseActiva = (estado) => estadoReciente === estado ? 'ACTIVO' : '';

            tablaHTML += `
                <tr>
                    <td>${alumno.apellido}, ${alumno.nombre}</td>
                    <td><button class="bloque_estado ${getClaseActiva('P')}" data-alumno-id="${alumno.id}" data-estado="P" onclick="manejarBloqueAsistencia(this)">P</button></td>
                    <td><button class="bloque_estado ${getClaseActiva('A')}" data-alumno-id="${alumno.id}" data-estado="A" onclick="manejarBloqueAsistencia(this)">A</button></td>
                    <td><button class="bloque_estado ${getClaseActiva('T')}" data-alumno-id="${alumno.id}" data-estado="T" onclick="manejarBloqueAsistencia(this)">T</button></td>
                    <td><button class="bloque_estado ${getClaseActiva('RA')}" data-alumno-id="${alumno.id}" data-estado="RA" onclick="manejarBloqueAsistencia(this)">RA</button></td>
                    <td><button class="bloque_estado ${getClaseActiva('AP')}" data-alumno-id="${alumno.id}" data-estado="AP" onclick="manejarBloqueAsistencia(this)">AP</button></td> <td><span class="estado_reciente">${estadoReciente}</span></td>
                </tr>
            `;
        }

        tablaHTML += `</tbody></table>`;
        listaAlumnos.innerHTML = tablaHTML;

    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        listaAlumnos.innerHTML = '<p>ERROR AL CARGAR LA LISTA DE ALUMNOS.</p>';
    }
}

// 4. Manejar el click de Asistencia (sin cambios en la lógica base)
window.manejarBloqueAsistencia = async function(boton) {
    const selectorCurso = document.getElementById('selectorCurso');
    const selectorMateria = document.getElementById('selectorMateria');
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');
    
    const alumno_id = boton.dataset.alumnoId;
    const estado = boton.dataset.estado;
    const curso_id = selectorCurso.value;
    const materia_id = selectorMateria.value;

    if (!curso_id || !materia_id) {
        alert('¡ERROR! Debes seleccionar un Curso y una Materia para registrar asistencia.');
        return;
    }
    
    const data = { alumno_id, curso_id, estado, materia_id };

    try {
        const respuesta = await fetch(`${URL_BASE}/registro`, { 
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const fila = boton.closest('tr');
        const celdaUltimoRegistro = fila.querySelector('.estado_reciente');
        
        if (respuesta.ok) {
            fila.querySelectorAll('.bloque_estado').forEach(b => b.classList.remove('ACTIVO'));
            boton.classList.add('ACTIVO');
            celdaUltimoRegistro.textContent = estado;
            
            cargarHistorial(inputInicio.value, inputFin.value); 
        } else {
            const errorData = await respuesta.json();
            alert(`ERROR EN REGISTRO. Mensaje del Servidor: ${errorData.message}`);
        }

    } catch (error) {
        console.error('Error al registrar:', error);
        alert('ERROR CRÍTICO DE CONEXIÓN. REVISE EL SERVIDOR.');
    }
}

// 5. Carga de Historial (Ahora incluye botones de edición)
async function cargarHistorial(fechaInicio, fechaFin) {
    const contenedorTablaHistorial = document.getElementById('contenedorTablaHistorial');
    contenedorTablaHistorial.innerHTML = '<p>Cargando registros...</p>';

    if (!fechaInicio || !fechaFin) {
         contenedorTablaHistorial.innerHTML = '<p>Ingrese las fechas para ver el historial.</p>';
         return;
    }

    try {
        const url = `${URL_BASE}/historial?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        const respuesta = await fetch(url);
        const historial = await respuesta.json();

        if (historial.length === 0) {
            contenedorTablaHistorial.innerHTML = '<p>No se encontraron registros en el rango de fechas.</p>';
            return;
        }

        let tablaHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>FECHA Y HORA</th>
                        <th>APELLIDO Y NOMBRE</th>
                        <th>CURSO</th>
                        <th>MATERIA</th>
                        <th>ESTADO</th>
                        <th>EDITAR</th> </tr>
                </thead>
                <tbody>
        `;

        historial.forEach(reg => {
            tablaHTML += `
                <tr>
                    <td>${reg.fecha_formato}</td>
                    <td>${reg.alumno_apellido}, ${reg.alumno_nombre}</td>
                    <td>${reg.curso_nombre}</td>
                    <td>${reg.materia_nombre}</td>
                    <td class="estado-${reg.estado}">${reg.estado}</td>
                    <td class="history-actions">
                        <button class="edit-btn" onclick="manejarEditarAsistencia(${reg.registro_id})">E</button>
                        <button class="delete-btn" onclick="manejarBorrarAsistencia(${reg.registro_id})">X</button>
                    </td>
                </tr>
            `;
        });

        tablaHTML += `</tbody></table>`;
        contenedorTablaHistorial.innerHTML = tablaHTML;

    } catch (error) {
        console.error('Error al cargar historial:', error);
        contenedorTablaHistorial.innerHTML = '<p>ERROR DE CONEXIÓN AL CARGAR EL HISTORIAL.</p>';
    }
}

// 7. Manejar la Edición del Registro (Botón E)
window.manejarEditarAsistencia = async function(registroId) {
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');

    const nuevoEstado = prompt(`Ingrese el nuevo estado para el registro ID ${registroId}. Opciones válidas: ${ESTADOS_VALIDOS.join(', ')}`);
    
    if (!nuevoEstado) {
        return; // El usuario canceló o dejó vacío
    }
    
    const estadoUpper = nuevoEstado.toUpperCase();

    if (!ESTADOS_VALIDOS.includes(estadoUpper)) {
        alert(`Estado "${nuevoEstado}" inválido. Por favor, use uno de: ${ESTADOS_VALIDOS.join(', ')}`);
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/registro/${registroId}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ estado: estadoUpper })
        });

        if (respuesta.ok) {
            alert('✅ Registro actualizado con éxito.');
            cargarHistorial(inputInicio.value, inputFin.value);
            // Opcionalmente, también recargar la lista de alumnos para actualizar el "ÚLTIMO REGISTRO"
        } else {
            const errorData = await respuesta.json();
            alert(`❌ Error al actualizar: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al editar:', error);
        alert('❌ ERROR CRÍTICO DE CONEXIÓN al editar.');
    }
}

// 8. Manejar el Borrado del Registro (Botón X)
window.manejarBorrarAsistencia = async function(registroId) {
    if (!confirm(`¿Está seguro de que desea eliminar el registro de ID ${registroId}? Esta acción no se puede deshacer.`)) {
        return;
    }

    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');

    try {
        const respuesta = await fetch(`${URL_BASE}/registro/${registroId}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert('🗑️ Registro eliminado con éxito.');
            cargarHistorial(inputInicio.value, inputFin.value);
            // Opcionalmente, recargar la lista de alumnos
        } else {
            const errorData = await respuesta.json();
            alert(`❌ Error al eliminar: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('❌ ERROR CRÍTICO DE CONEXIÓN al eliminar.');
    }
}


// 6. Configurar fechas por defecto
function configurarFechasPorDefecto() {
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');
    
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const formatoFecha = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    inputFin.value = formatoFecha(hoy);
    inputInicio.value = formatoFecha(hace30Dias);
}


// --- EVENT LISTENER PRINCIPAL (Cuando la página carga) ---

document.addEventListener('DOMContentLoaded', () => {
    // Definición de selectores 
    const selectorCurso = document.getElementById('selectorCurso');
    const selectorMateria = document.getElementById('selectorMateria');
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');
    const botonFiltrar = document.getElementById('botonFiltrar');
    
    const formularioAltaAlumno = document.getElementById('formularioAltaAlumno');
    const selectorCursoNuevo = document.getElementById('selectorCursoNuevo');
    const inputNombre = document.getElementById('inputNombre'); 
    const inputApellido = document.getElementById('inputApellido'); 
    const mensajeRespuesta = document.getElementById('mensajeRespuesta');


    // 1. Selector de Curso
    selectorCurso.addEventListener('change', () => {
        const cursoId = selectorCurso.value;
        const materiaId = selectorMateria.value;
        cargarMaterias(cursoId);
        cargarAlumnos(cursoId, materiaId);
    });

    // 2. Selector de Materia
    selectorMateria.addEventListener('change', () => {
        const cursoId = selectorCurso.value;
        const materiaId = selectorMateria.value;
        cargarAlumnos(cursoId, materiaId);
    });
    
    // 3. Botón Filtrar Historial
    botonFiltrar.addEventListener('click', () => {
        const inicio = inputInicio.value;
        const fin = inputFin.value;
        cargarHistorial(inicio, fin);
    });

    // 4. Alta de nuevo alumno (Lógica del formulario)
    formularioAltaAlumno.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            nombre: inputNombre.value,
            apellido: inputApellido.value,
            curso_id: selectorCursoNuevo.value
        };

        if (!data.nombre || !data.apellido || !data.curso_id) {
            mensajeRespuesta.textContent = 'COMPLETE TODOS LOS CAMPOS.';
            mensajeRespuesta.style.color = '#E74C3C';
            return;
        }

        try {
            const respuesta = await fetch(`${URL_BASE}/alumno`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                mensajeRespuesta.textContent = `ÉXITO. ${resultado.mensaje}`;
                mensajeRespuesta.style.color = '#175447';
                
                formularioAltaAlumno.reset();
                
                if (selectorCurso.value === data.curso_id) {
                    const materiaId = selectorMateria.value;
                    cargarAlumnos(data.curso_id, materiaId);
                }
                
            } else {
                mensajeRespuesta.textContent = `ERROR: ${resultado.mensaje}`;
                mensajeRespuesta.style.color = '#E74C3C';
            }
        } catch (error) {
            mensajeRespuesta.textContent = 'ERROR DE RED.';
            mensajeRespuesta.style.color = '#E74C3C';
        }
    });


    // --- INICIALIZACIÓN ---
    
    cargarCursos();
    configurarFechasPorDefecto(); 
    cargarHistorial(inputInicio.value, inputFin.value);
});