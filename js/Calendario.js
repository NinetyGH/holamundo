// Variables globales
let fechaActual = new Date();
let fechaSeleccionada = null;
let eventoSeleccionado = null;
let eventos = {};

// Elementos del DOM
const cuadriculaCalendario = document.getElementById('cuadriculaCalendario');
const elementoVistaActual = document.getElementById('vistaActual');
const modalEvento = document.getElementById('modalEvento');
const vistaAño = document.getElementById('vistaAño');
const vistaMes = document.getElementById('vistaMes');
const selectorVista = document.getElementById('selectorVista');

// Función para animar cambios de contenido
function animarCambioContenido(elemento, callback) {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    setTimeout(() => {
        callback();
        elemento.style.opacity = '1';
        elemento.style.transform = 'translateY(0)';
    }, 300);
}

// Función para actualizar el calendario
function actualizarCalendario() {
    const vista = selectorVista.value;
    const contenido = vista === 'mes' ? cuadriculaCalendario : vistaAño;
    animarCambioContenido(contenido, () => {
        vista === 'mes' ? actualizarVistaMes() : actualizarVistaAño();
    });
}

// Actualizar vista mensual
function actualizarVistaMes() {
    vistaAño.classList.add('oculto');
    vistaMes.classList.remove('oculto');
    cuadriculaCalendario.innerHTML = '';

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    
    elementoVistaActual.textContent = new Date(año, mes)
        .toLocaleDateString('es', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase());

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diaInicio = primerDia.getDay();
    const totalDias = ultimoDia.getDate();

    // Crear y añadir todos los días
    const fragmento = document.createDocumentFragment();
    for (let i = -diaInicio + 1; i <= 35 - diaInicio; i++) {
        const diaActual = new Date(año, mes, i);
        const elementoDia = crearElementoDia(diaActual, i <= 0 || i > totalDias);
        elementoDia.classList.add('animacion-cambio-mes');
        elementoDia.style.animationDelay = `${Math.abs(i) * 20}ms`;
        fragmento.appendChild(elementoDia);
    }
    cuadriculaCalendario.appendChild(fragmento);
}

// Actualizar vista anual
function actualizarVistaAño() {
    vistaMes.classList.add('oculto');
    vistaAño.classList.remove('oculto');
    vistaAño.innerHTML = '';

    const año = fechaActual.getFullYear();
    elementoVistaActual.textContent = año.toString();
    
    const fragmento = document.createDocumentFragment();
    for (let mes = 0; mes < 12; mes++) {
        const elementoMes = document.createElement('div');
        elementoMes.className = 'vista-previa-mes animacion-cambio-año';
        elementoMes.style.animationDelay = `${mes * 50}ms`;
        
        const nombreMes = new Date(año, mes)
            .toLocaleDateString('es', { month: 'long' })
            .replace(/^\w/, c => c.toUpperCase());
        
        elementoMes.innerHTML = `
            <h3>${nombreMes}</h3>
            <div class="cuadricula-vista-previa-mes">
                ${crearVistaPreviaMes(año, mes)}
            </div>
        `;

        elementoMes.addEventListener('click', () => {
            fechaActual = new Date(año, mes, 1);
            selectorVista.value = 'mes';
            actualizarCalendario();
        });

        fragmento.appendChild(elementoMes);
    }
    vistaAño.appendChild(fragmento);
}

// Crear la vista previa de un mes (días)
function crearVistaPreviaMes(año, mes) {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const totalDias = ultimoDia.getDate();

    // Crear una cuadrícula básica para mostrar los días del mes
    let vistaPrevia = '';
    for (let dia = 1; dia <= totalDias; dia++) {
        const fechaActual = new Date(año, mes, dia);
        const cadenaFecha = fechaActual.toISOString().split('T')[0];
        const tieneEvento = eventos[cadenaFecha] && eventos[cadenaFecha].length > 0;

        vistaPrevia += `
            <div class="dia-vista-previa-mes ${tieneEvento ? 'tiene-evento' : ''}">
                ${dia}
            </div>
        `;
    }
    return vistaPrevia;
}

// Crear elemento de día
function crearElementoDia(fecha, esOtroMes) {
    const elementoDia = document.createElement('div');
    elementoDia.className = `dia-calendario ${esOtroMes ? 'otro-mes' : ''}`;
    
    const numeroDia = document.createElement('div');
    numeroDia.className = 'numero-dia';
    numeroDia.textContent = fecha.getDate();
    elementoDia.appendChild(numeroDia);

    const cadenaFecha = fecha.toISOString().split('T')[0];
    if (eventos[cadenaFecha]) {
        const eventosAMostrar = eventos[cadenaFecha].slice(0, 2);
        eventosAMostrar.forEach(evento => {
            const elementoEvento = document.createElement('div');
            elementoEvento.className = 'evento evento-truncado';
            elementoEvento.textContent = `${evento.hora} ${evento.titulo}`;
            elementoEvento.title = `${evento.hora} ${evento.titulo}`; // Agregar título completo como tooltip
            elementoEvento.addEventListener('click', (e) => {
                e.stopPropagation();
                mostrarModalEvento(fecha, evento);
            });
            elementoDia.appendChild(elementoEvento);
        });

        if (eventos[cadenaFecha].length > 2) {
            const botonVerMas = document.createElement('button');
            botonVerMas.className = 'boton-ver-mas';
            botonVerMas.textContent = `Ver ${eventos[cadenaFecha].length - 2} más`;
            botonVerMas.addEventListener('click', (e) => {
                e.stopPropagation();
                mostrarMenuEventos(fecha, eventos[cadenaFecha]);
            });
            elementoDia.appendChild(botonVerMas);
        }
    }

    elementoDia.addEventListener('click', () => mostrarModalEvento(fecha));
    return elementoDia;
}

// Mostrar modal de evento
function mostrarModalEvento(fecha, evento = null) {
    fechaSeleccionada = fecha;
    eventoSeleccionado = evento;
    const tituloModal = document.getElementById('tituloModal');
    const inputFechaEvento = document.getElementById('fechaEvento');
    const inputTituloEvento = document.getElementById('tituloEvento');
    const inputHoraEvento = document.getElementById('horaEvento');
    const inputDescripcionEvento = document.getElementById('descripcionEvento');
    const botonEliminar = document.getElementById('botonEliminarEvento');

    tituloModal.textContent = evento ? 'Editar Evento' : 'Nuevo Evento';
    inputFechaEvento.value = fecha.toISOString().split('T')[0];
    inputTituloEvento.value = evento ? evento.titulo : '';
    inputHoraEvento.value = evento ? evento.hora : '';
    inputDescripcionEvento.value = evento ? evento.descripcion : '';
    botonEliminar.classList.toggle('oculto', !evento);

    modalEvento.style.display = 'block';
    setTimeout(() => modalEvento.style.opacity = '1', 10);
}

// Guardar evento
function guardarEvento() {
    const fecha = new Date(document.getElementById('fechaEvento').value);
    const titulo = document.getElementById('tituloEvento').value;
    const hora = document.getElementById('horaEvento').value;
    const descripcion = document.getElementById('descripcionEvento').value;
    
    if (titulo && hora) {
        const cadenaFecha = fecha.toISOString().split('T')[0];
        if (!eventos[cadenaFecha]) eventos[cadenaFecha] = [];

        if (eventoSeleccionado) {
            const indice = eventos[cadenaFecha].indexOf(eventoSeleccionado);
            eventos[cadenaFecha][indice] = { titulo, hora, descripcion };
        } else {
            eventos[cadenaFecha].push({ titulo, hora, descripcion });
        }

        cerrarModal();
        actualizarCalendario();
    }
}

// Eliminar evento
function eliminarEvento() {
    if (eventoSeleccionado && fechaSeleccionada) {
        const cadenaFecha = fechaSeleccionada.toISOString().split('T')[0];
        const indice = eventos[cadenaFecha].indexOf(eventoSeleccionado);
        eventos[cadenaFecha].splice(indice, 1);
        
        if (eventos[cadenaFecha].length === 0) {
            delete eventos[cadenaFecha];
        }

        cerrarModal();
        actualizarCalendario();
    }
}

// Cerrar modal
function cerrarModal() {
    modalEvento.style.opacity = '0';
    setTimeout(() => {
        modalEvento.style.display = 'none';
        actualizarCalendario();
    }, 300);
}

// Mostrar menú de eventos
function mostrarMenuEventos(fecha, eventosDelDia) {
    const menuEventos = document.createElement('div');
    menuEventos.className = 'menu-eventos';
    
    const cabeceraMenu = document.createElement('div');
    cabeceraMenu.className = 'cabecera-menu-eventos';
    cabeceraMenu.textContent = fecha.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    menuEventos.appendChild(cabeceraMenu);

    const botonCerrar = document.createElement('button');
    botonCerrar.className = 'boton-cerrar';
    botonCerrar.innerHTML = '<span class="material-icons">close</span>';
    botonCerrar.addEventListener('click', (e) => {
        e.stopPropagation();
        menuEventos.remove();
        document.removeEventListener('click', cerrarMenuEventos);
    });
    cabeceraMenu.appendChild(botonCerrar);

    const listaEventos = document.createElement('div');
    listaEventos.className = 'lista-eventos';
    eventosDelDia.forEach(evento => {
        const itemEvento = document.createElement('div');
        itemEvento.className = 'item-evento';
        itemEvento.innerHTML = `
            <span class="hora-evento">${evento.hora}</span>
            <span class="titulo-evento evento-truncado">${evento.titulo}</span>
        `;
        itemEvento.title = evento.titulo; // Agregar título completo como tooltip
        itemEvento.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEventos.remove();
            document.removeEventListener('click', cerrarMenuEventos);
            mostrarModalEvento(fecha, evento);
        });
        listaEventos.appendChild(itemEvento);
    });
    menuEventos.appendChild(listaEventos);

    document.body.appendChild(menuEventos);

    // Agregar evento para cerrar el menú al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', cerrarMenuEventos);
    }, 0);

    function cerrarMenuEventos(e) {
        if (!menuEventos.contains(e.target)) {
            menuEventos.remove();
            document.removeEventListener('click', cerrarMenuEventos);
        }
    }
}

// Event Listeners
document.getElementById('botonAnterior').addEventListener('click', () => {
    if (selectorVista.value === 'mes') {
        fechaActual.setMonth(fechaActual.getMonth() - 1);
    } else if (selectorVista.value === 'año') {
        fechaActual.setFullYear(fechaActual.getFullYear() - 1);
    }
    actualizarCalendario();
});

document.getElementById('botonSiguiente').addEventListener('click', () => {
    if (selectorVista.value === 'mes') {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
    } else if (selectorVista.value === 'año') {   
        fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }
    actualizarCalendario();
});

document.getElementById('botonGuardarEvento').addEventListener('click', guardarEvento);
document.getElementById('botonEliminarEvento').addEventListener('click', eliminarEvento);
document.getElementById('botonCerrarModal').addEventListener('click', cerrarModal);
document.getElementById('botonCrearEvento').addEventListener('click', () => mostrarModalEvento(new Date()));
document.getElementById('botonHoy').addEventListener('click', () => {
    fechaActual = new Date();
    actualizarCalendario();
});

selectorVista.addEventListener('change', actualizarCalendario);

// Inicializar calendario
document.addEventListener('DOMContentLoaded', actualizarCalendario);

// Agregamos la lógica para la pantalla de carga al inicio del archivo
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el elemento de la pantalla de carga
    const pantallaCarga = document.querySelector('.pantalla-carga');

    // Función para ocultar la pantalla de carga
    function ocultarPantallaCarga() {
        pantallaCarga.classList.add('oculta');
    }

    // Simulamos un tiempo de carga de 2 segundos
    setTimeout(ocultarPantallaCarga, 2000);

    // El resto del código JavaScript existente permanece sin cambios
    // Variables globales
    let fechaActual = new Date();
    let fechaSeleccionada = null;
    let eventoSeleccionado = null;
    let eventos = {};

    // ... (el resto del código JavaScript existente)
});
