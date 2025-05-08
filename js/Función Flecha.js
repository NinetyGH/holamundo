document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el elemento de la pantalla de carga
    const pantallaCarga = document.querySelector('.pantalla-carga');

    // Función para ocultar la pantalla de carga
    function ocultarPantallaCarga() {
        pantallaCarga.classList.add('oculta');
    }

    // Simulamos un tiempo de carga de 2 segundos
    setTimeout(ocultarPantallaCarga, 2000);

    const botonInicio = document.getElementById('botonInicio');
    const salida = document.getElementById('salida');

    const funcionFlecha = (mensaje) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`¡Esta es una función flecha! ${mensaje}`);
            }, 1000);
        });
    }

    botonInicio.addEventListener('click', async () => {
        botonInicio.disabled = true;
        salida.textContent = "Procesando...";
        salida.classList.add('mostrar');

        try {
            const resultado = await funcionFlecha("Observa su poder y flexibilidad.");
            salida.textContent = resultado;
            salida.style.animation = 'aparecer 0.5s ease-out';
        } catch (error) {
            salida.textContent = "Ocurrió un error: " + error.message;
        } finally {
            botonInicio.disabled = false;
        }
    });

    // Agregar partículas flotantes
    const contenedor = document.querySelector('.contenedor');
    for (let i = 0; i < 20; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        particula.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background-color: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: flotar ${Math.random() * 10 + 5}s infinite ease-in-out;
        `;
        contenedor.appendChild(particula);
    }
});

