let productos = JSON.parse(localStorage.getItem('productos')) || [];
let idActual = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;

document.getElementById('formProducto').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const stock = parseInt(document.getElementById('stockProducto').value) || 0;

    if (nombre && !isNaN(precio)) {
        const nuevoProducto = {
            id: idActual,
            nombre: nombre,
            precio: precio,
            stock: stock
        };

        productos.push(nuevoProducto);
        localStorage.setItem('productos', JSON.stringify(productos));
        idActual++;
        actualizarListaProductos();
        document.getElementById('formProducto').reset();
    } else {
        alert('Por favor, completa todos los campos obligatorios.');
    }
});

function actualizarListaProductos() {
    const tablaBody = document.querySelector('#tablaProductos tbody');
    tablaBody.innerHTML = '';

    productos.forEach(producto => {
        const fila = document.createElement('tr');

        const celdaCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.id = producto.id;
        celdaCheckbox.appendChild(checkbox);

        const celdaId = document.createElement('td');
        celdaId.textContent = producto.id;

        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = producto.nombre;

        const celdaPrecio = document.createElement('td');
        celdaPrecio.textContent = `$${producto.precio.toFixed(2)}`;

        const celdaStock = document.createElement('td');
        celdaStock.textContent = producto.stock;

        fila.appendChild(celdaCheckbox);
        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);

        tablaBody.appendChild(fila);
    });

    // Aplicar filtro si hay texto en el input
    const filtro = document.getElementById('buscarProductoInput').value.toLowerCase();
    filtrarProductos(filtro);
}

document.getElementById('buscarProductoInput').addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    filtrarProductos(filtro);
});

function filtrarProductos(filtro) {
    const filas = document.querySelectorAll('#tablaProductos tbody tr');
    const mensaje = document.getElementById('mensajeSinResultados');
    let coincidencias = 0;

    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        const coincide = textoFila.includes(filtro);
        fila.style.display = coincide ? '' : 'none';
        if (coincide) coincidencias++;
    });

    mensaje.style.display = coincidencias === 0 ? 'block' : 'none';
}

document.getElementById('eliminarProducto').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]:checked');
    const idsAEliminar = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.id));

    if (idsAEliminar.length > 0) {
        productos = productos.filter(producto => !idsAEliminar.includes(producto.id));
        localStorage.setItem('productos', JSON.stringify(productos));
        actualizarListaProductos();
        alert('Productos eliminados correctamente.');
    } else {
        alert('Por favor, selecciona al menos un producto para eliminar.');
    }
});

document.addEventListener('DOMContentLoaded', actualizarListaProductos);
