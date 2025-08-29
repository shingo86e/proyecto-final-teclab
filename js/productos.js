let productos = JSON.parse(localStorage.getItem('productos')) || []; // Cargar productos desde Local Storage
let idActual = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1; // Continuar con el último ID

document.getElementById('formProducto').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const stock = parseInt(document.getElementById('stockProducto').value) || 0;

    if (nombre && !isNaN(precio)) {
        // Crear un nuevo producto con ID incremental
        const nuevoProducto = {
            id: idActual,
            nombre: nombre,
            precio: precio,
            stock: stock
        };

        // Agregar el producto al array
        productos.push(nuevoProducto);

        // Guardar en Local Storage
        localStorage.setItem('productos', JSON.stringify(productos));

        // Incrementar el ID para el próximo producto
        idActual++;

        // Actualizar la lista en el DOM
        actualizarListaProductos();

        // Limpiar el formulario
        document.getElementById('formProducto').reset();
    } else {
        alert('Por favor, completa todos los campos obligatorios.');
    }
});

function actualizarListaProductos() {
    const tablaBody = document.querySelector('#tablaProductos tbody');
    tablaBody.innerHTML = ''; // Limpiar las filas de la tabla

    productos.forEach(producto => {
        const fila = document.createElement('tr');

        // Crear celdas para cada propiedad del producto
        const celdaId = document.createElement('td');
        celdaId.textContent = producto.id;

        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = producto.nombre;

        const celdaPrecio = document.createElement('td');
        celdaPrecio.textContent = `$${producto.precio.toFixed(2)}`;

        const celdaStock = document.createElement('td');
        celdaStock.textContent = producto.stock;

        // Agregar las celdas a la fila
        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);

        // Agregar la fila al cuerpo de la tabla
        tablaBody.appendChild(fila);
    });
}

// buscar productos
document.getElementById('buscarProducto').addEventListener('click', function() {
    const nombreBuscado = prompt('Ingrese el nombre del producto a buscar:').trim().toLowerCase();
    const productoEncontrado = productos.find(p => p.nombre.toLowerCase() === nombreBuscado);

    if (productoEncontrado) {
        alert(`Producto encontrado:\nID: ${productoEncontrado.id}\nNombre: ${productoEncontrado.nombre}\nPrecio: $${productoEncontrado.precio}\nStock: ${productoEncontrado.stock}`);
    } else {
        alert('Producto no encontrado.');
    }
});

// Cargar la lista de productos al cargar la página
document.addEventListener('DOMContentLoaded', actualizarListaProductos);
