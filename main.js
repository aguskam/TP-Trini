const URL_BASE = 'http://localhost:3000'; 
const ESTADOS_VALIDOS = ['P', 'A', 'T', 'RA', 'AP']; 
const NOMBRES_ESTADO = {
    'P': 'PRESENTE', 
    'A': 'AUSENTE', 
    'T': 'TARDE', 
    'RA': 'RET. C/ AV.', 
    'AP': 'ABS. JUST.'
};

function obtenerNombreEstado(estado) {
    return NOMBRES_ESTADO[estado] || estado;
}

async function cargarCursos() {
    const selectorCurso = document.getElementById('selectorCurso');
    const selectorCursoNuevo = document.getElementById('selectorCursoNuevo');
    
    try {
        const respuesta = await fetch(`${URL_BASE}/cursos`);
        const cursos = await respuesta.json(); 
        
        const opcionesCursos = cursos.map(curso => 
            `<option value="${curso.id}">${curso.nombre}</option>`
        ).join('');

        selectorCurso.innerHTML = '<option value="">-- Seleccione un curso --</option>' + opcionesCursos;
        selectorCursoNuevo.innerHTML = '<option value="">-- Seleccione curso --</option>' + opcionesCursos;
        
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}


async function cargarMaterias(cursoId) {
    const selectorMateria = document.getElementById('selectorMateria');
    selectorMateria.innerHTML = '<option value="">-- Cargando materias --</option>';
    selectorMateria.disabled = true;

    if (!cursoId) {
        selectorMateria.innerHTML = '<option value="">-- Seleccione curso primero --</option>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/materias/${cursoId}`);
        const materias = await respuesta.json();
        
        if (materias.length === 0) {
            selectorMateria.innerHTML = '<option value="">-- No hay materias asignadas --</option>';
        } else {
            const opcionesMaterias = materias.map(materia => 
                `<option value="${materia.id}">${materia.nombre}</option>`
            ).join('');
            selectorMateria.innerHTML = '<option value="">-- Seleccione una materia --</option>' + opcionesMaterias;
            selectorMateria.disabled = false;
        }

    } catch (error) {
        console.error('Error al cargar materias:', error);
        selectorMateria.innerHTML = '<p>Error de conexión.</p>';
    }
}


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
                        ${ESTADOS_VALIDOS.map(e => `<th>${obtenerNombreEstado(e)}</th>`).join('')}
                        <th>ÚLTIMO REGISTRO</th>
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
                    ${ESTADOS_VALIDOS.map(estado => `
                        <td>
                            <div class="checkbox-container">
                                <div class="custom-checkbox ${getClaseActiva(estado)}" 
                                    data-alumno-id="${alumno.id}" 
                                    data-estado="${estado}" 
                                    onclick="manejarCheckboxAsistencia(this)">
                                </div>
                            </div>
                        </td>
                    `).join('')}
                    <td><span class="estado_reciente">${estadoReciente}</span></td>
                </tr>
            `;
        }

        tablaHTML += `</tbody></table>`;
        listaAlumnos.innerHTML = tablaHTML;

    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        listaAlumnos.innerHTML = '<p>Error al cargar la lista de alumnos.</p>';
    }
}

// Lógica de manejo de la selección (simula el radio button)
window.manejarCheckboxAsistencia = async function(checkbox) {
    const selectorCurso = document.getElementById('selectorCurso');
    const selectorMateria = document.getElementById('selectorMateria');
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');
    
    const alumno_id = checkbox.dataset.alumnoId;
    const estado = checkbox.dataset.estado;
    const curso_id = selectorCurso.value;
    const materia_id = selectorMateria.value;

    if (!curso_id || !materia_id) {
        alert('¡Error! Debes seleccionar un curso y una materia para registrar asistencia.');
        return;
    }
    
    const fila = checkbox.closest('tr');
    const celdaUltimoRegistro = fila.querySelector('.estado_reciente');
    
    // Si ya está activo, deselecciona y registra "N/A" (o un estado por defecto si lo tienes)
    // Para simplificar, si está activo, no hacemos nada para evitar registros dobles innecesarios,
    // simplemente aseguramos que sea una nueva selección.
    
    // 1. Quita la clase ACTIVO de todos los checkboxes en la misma fila (mismo alumno)
    fila.querySelectorAll('.custom-checkbox').forEach(c => c.classList.remove('ACTIVO'));
    
    // 2. Marca este checkbox como ACTIVO
    checkbox.classList.add('ACTIVO');

    // 3. Registra el nuevo estado
    const data = { alumno_id, curso_id, estado, materia_id };

    try {
        const respuesta = await fetch(`${URL_BASE}/registro`, { 
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (respuesta.ok) {
            celdaUltimoRegistro.textContent = estado;
            cargarHistorial(inputInicio.value, inputFin.value); 
        } else {
            const errorData = await respuesta.json();
            alert(`Error en registro. Mensaje del servidor: ${errorData.message}`);
            // En caso de error, volvemos a marcar el estado anterior si es posible
            checkbox.classList.remove('ACTIVO'); 
        }

    } catch (error) {
        console.error('Error al registrar:', error);
        alert('Error crítico de conexión. Revise el servidor.');
        checkbox.classList.remove('ACTIVO');
    }
}


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
                        <th>Fecha y hora</th>
                        <th>Apellido y nombre</th>
                        <th>Curso</th>
                        <th>Materia</th>
                        <th>Estado</th>
                        <th>Editar</th> </tr>
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
        contenedorTablaHistorial.innerHTML = '<p>Error de conexión al cargar el historial.</p>';
    }
}


window.manejarEditarAsistencia = async function(registroId) {
    const inputInicio = document.getElementById('fechaInicio');
    const inputFin = document.getElementById('fechaFin');

    const nuevoEstado = prompt(`Ingrese el nuevo estado para el registro ID ${registroId}. Opciones válidas: ${ESTADOS_VALIDOS.join(', ')}`);
    
    if (!nuevoEstado) {
        return; 
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
            alert('Registro actualizado con éxito.');
            cargarHistorial(inputInicio.value, inputFin.value);
        } else {
            const errorData = await respuesta.json();
            alert(`Error al actualizar: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al editar:', error);
        alert(' Error crítico de conexión al editar.');
    }
}

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
            alert('Registro eliminado con éxito.');
            cargarHistorial(inputInicio.value, inputFin.value);
        } else {
            const errorData = await respuesta.json();
            alert(`Error al eliminar: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error crítico de conexión al eliminar.');
    }
}



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


    selectorCurso.addEventListener('change', () => {
        const cursoId = selectorCurso.value;
        const materiaId = selectorMateria.value;
        cargarMaterias(cursoId);
        cargarAlumnos(cursoId, materiaId);
    });

    selectorMateria.addEventListener('change', () => {
        const cursoId = selectorCurso.value;
        const materiaId = selectorMateria.value;
        cargarAlumnos(cursoId, materiaId);
    });
    
    botonFiltrar.addEventListener('click', () => {
        const inicio = inputInicio.value;
        const fin = inputFin.value;
        cargarHistorial(inicio, fin);
    });

    formularioAltaAlumno.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            nombre: inputNombre.value,
            apellido: inputApellido.value,
            curso_id: selectorCursoNuevo.value
        };

        if (!data.nombre || !data.apellido || !data.curso_id) {
            mensajeRespuesta.textContent = 'Complete todos los campos.';
            mensajeRespuesta.style.color = '#E74C3C'; // Rojo
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
                mensajeRespuesta.textContent = `Éxito. ${resultado.mensaje}`;
                mensajeRespuesta.style.color = '#000000'; // Negro
                
                formularioAltaAlumno.reset();
                
                if (selectorCurso.value === data.curso_id) {
                    const materiaId = selectorMateria.value;
                    cargarAlumnos(data.curso_id, materiaId);
                }
                
            } else {
                mensajeRespuesta.textContent = `Error: ${resultado.mensaje}`;
                mensajeRespuesta.style.color = '#E74C3C'; // Rojo
            }
        } catch (error) {
            mensajeRespuesta.textContent = 'Error de red.';
            mensajeRespuesta.style.color = '#E74C3C'; // Rojo
        }
    });

    
    cargarCursos();
    configurarFechasPorDefecto(); 
    cargarHistorial(inputInicio.value, inputFin.value);

});
