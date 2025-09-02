let productos = [];
let idActual = 1;

const rutaProductosAPI = 'http://localhost:3000/productos';

// Función para guardar productos en el servidor
async function guardarProductosEnServidor() {
    try {
        const response = await fetch(rutaProductosAPI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productos),
        });
        if (!response.ok) {
            throw new Error('Error al guardar productos en el servidor');
        }
    } catch (error) {
        console.error('Error al guardar productos en el servidor:', error);
    }
}

// Función para cargar productos desde el servidor
async function cargarProductosDesdeServidor() {
    try {
        const response = await fetch(rutaProductosAPI);
        if (response.ok) {
            productos = await response.json();
            idActual = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;
            actualizarListaProductos();
        } else {
            console.error('Error al cargar productos desde el servidor:', response.statusText);
        }
    } catch (error) {
        console.error('Error al cargar productos desde el servidor:', error);
    }
}

// Función para actualizar la tabla de productos
function actualizarListaProductos() {
    const tablaBody = document.querySelector('#tablaProductos tbody');
    tablaBody.innerHTML = '';

    productos.forEach(producto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><input type="checkbox" data-id="${producto.id}"></td>
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.precio}</td>
            <td>${producto.stock}</td>
            <td>
                ${producto.imagen ? `<img src="${producto.imagen}" alt="Imagen del producto" style="width: 50px; height: 50px;">` : 'Sin imagen'}
            </td>
        `;
        tablaBody.appendChild(fila);
    });

    // Mostrar u ocultar el mensaje de "sin resultados"
    const mensajeSinResultados = document.getElementById('mensajeSinResultados');
    mensajeSinResultados.style.display = productos.length === 0 ? 'block' : 'none';
}

// Evento para guardar un nuevo producto
document.getElementById('formProducto').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const stock = parseInt(document.getElementById('stockProducto').value) || 0;
    const imagenInput = document.getElementById('imagenProducto');
    let imagenBase64 = '';

    // Validar campos obligatorios
    if (!nombre || isNaN(precio) || isNaN(stock)) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    // Convertir la imagen a Base64 si se cargó
    if (imagenInput.files && imagenInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenBase64 = e.target.result;
            guardarProducto(nombre, precio, stock, imagenBase64);
        };
        reader.readAsDataURL(imagenInput.files[0]);
    } else {
        guardarProducto(nombre, precio, stock, imagenBase64);
    }
});

async function guardarProducto(nombre, precio, stock, imagenBase64) {
    const nuevoProducto = {
        id: idActual,
        nombre: nombre,
        precio: precio,
        stock: stock,
        imagen: imagenBase64
    };

    productos.push(nuevoProducto);
    idActual++;
    actualizarListaProductos();
    await guardarProductosEnServidor(); // Guardar en el servidor
    document.getElementById('formProducto').reset();
}

// Evento para eliminar productos seleccionados
document.getElementById('eliminarProducto').addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]:checked');
    const idsAEliminar = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.id));

    if (idsAEliminar.length > 0) {
        productos = productos.filter(producto => !idsAEliminar.includes(producto.id));
        actualizarListaProductos();
        await guardarProductosEnServidor(); // Guardar en el servidor
        alert('Productos eliminados correctamente.');
    } else {
        alert('Por favor, selecciona al menos un producto para eliminar.');
    }
});

// Filtrar productos al escribir en el campo de búsqueda
document.getElementById('buscarProductoInput').addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaProductos tbody tr');

    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? '' : 'none';
    });
});

// Cargar productos desde el servidor al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductosDesdeServidor);
