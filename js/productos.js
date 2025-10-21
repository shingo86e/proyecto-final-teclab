// Botón cancelar: limpia los campos del formulario y la búsqueda
document.getElementById('btnCancelarProducto').addEventListener('click', function() {
    document.getElementById('formProducto').reset();
    document.getElementById('buscarProductoInput').value = '';
    productoEditandoId = null;
    // Limpiar selección de checkboxes
    const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
});
// Referencia a Firestore (ya declarada en el HTML)

let productos = [];
let productoEditandoId = null;


document.getElementById('formProducto').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const stock = parseInt(document.getElementById('stockProducto').value) || 0;

    if (nombre && !isNaN(precio)) {
        try {
            if (productoEditandoId) {
                // Editar producto existente
                await db.collection('productos').doc(productoEditandoId).update({
                    nombre,
                    precio,
                    stock
                });
                mostrarNotificacion('Producto editado exitosamente.');
                productoEditandoId = null;
            } else {
                // Registrar nuevo producto
                await db.collection('productos').add({
                    nombre,
                    precio,
                    stock
                });
                mostrarNotificacion('Producto agregado exitosamente.');
            }
            document.getElementById('formProducto').reset();
            // Limpiar selección de checkboxes tras editar o agregar
            const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        } catch (error) {
            alert('Error al guardar el producto: ' + error.message);
        }
    } else {
        alert('Por favor, completa todos los campos obligatorios.');
    }
});
    

// Lógica para cargar el producto seleccionado en el formulario para editar
document.getElementById('editarProducto').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]');
    const seleccionados = Array.from(checkboxes).filter(cb => cb.checked);
    if (seleccionados.length !== 1) {
        alert('Por favor, selecciona UN solo producto para editar.');
        return;
    }
    // Desmarcar todos menos el seleccionado
    checkboxes.forEach(cb => cb.checked = false);
    seleccionados[0].checked = true;
    const id = seleccionados[0].dataset.id;
    const producto = productos.find(p => p.id === id);
    if (producto) {
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('precioProducto').value = producto.precio;
        document.getElementById('stockProducto').value = producto.stock;
        productoEditandoId = producto.id;
    }
});

// Función para mostrar notificaciones centradas
function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 2000);
}

function actualizarListaProductos() {
    const tablaBody = document.querySelector('#tablaProductos tbody');
    tablaBody.innerHTML = '';
    // Ordenar productos por stock ascendente (menor a mayor)
    const productosOrdenados = productos.slice().sort((a, b) => {
        const sa = parseInt(a.stock) || 0;
        const sb = parseInt(b.stock) || 0;
        return sa - sb;
    });

    productosOrdenados.forEach(producto => {
        const fila = document.createElement('tr');

        const celdaCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.id = producto.id;
        celdaCheckbox.appendChild(checkbox);

    const celdaNombre = document.createElement('td');
    celdaNombre.textContent = producto.nombre || '';

    const celdaPrecio = document.createElement('td');
    let precio = producto.precio;
    if (precio === undefined || precio === null || isNaN(precio)) precio = 0;
    celdaPrecio.textContent = `$${Number(precio).toFixed(2)}`;

    const celdaStock = document.createElement('td');
    let stock = producto.stock;
    if (stock === undefined || stock === null || isNaN(stock)) stock = 0;
    celdaStock.textContent = stock;

    // Columna de alerta: mostrar icono si stock < 5
    const celdaAlerta = document.createElement('td');
    celdaAlerta.classList.add('celda-alerta');
    const stockNum = parseInt(stock) || 0;
    if (stockNum < 5) {
        // SVG inline para icono de alerta (triángulo con signo de exclamación)
        celdaAlerta.innerHTML = `
            <span class="icon-alerta" title="Bajo stock" role="img" aria-label="Bajo stock">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M1 21h22L12 2 1 21z" fill="#d32f2f"></path>
                    <rect x="11" y="10" width="2" height="5" fill="#fff"></rect>
                    <circle cx="12" cy="17" r="1" fill="#fff"></circle>
                </svg>
            </span>
        `;
        celdaAlerta.classList.add('has-alert');
    } else {
        celdaAlerta.textContent = '';
        celdaAlerta.classList.remove('has-alert');
    }

    fila.appendChild(celdaCheckbox);
    fila.appendChild(celdaNombre);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaStock);
    fila.appendChild(celdaAlerta);

        tablaBody.appendChild(fila);
    });

    // Aplicar filtro si hay texto en el input
    const filtro = document.getElementById('buscarProductoInput').value.toLowerCase();
    filtrarProductos(filtro);
    // Actualizar tabla de bajo stock cada vez que cambiamos la lista
    actualizarTablaBajoStock();
}

// Actualiza la tabla lateral con productos con stock menor a 5
function actualizarTablaBajoStock() {
    const tbody = document.querySelector('#tablaBajoStock tbody');
    if (!tbody) return; // si la página no tiene la tabla, salir
    tbody.innerHTML = '';
    const bajos = productos.filter(p => {
        const stock = parseInt(p.stock) || 0;
        return stock < 5;
    });
    if (bajos.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.textContent = 'No hay productos con bajo stock.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    bajos.forEach(p => {
        const tr = document.createElement('tr');
        const tdNombre = document.createElement('td');
        tdNombre.textContent = p.nombre || '';
        const tdStock = document.createElement('td');
        tdStock.textContent = (isNaN(parseInt(p.stock)) ? 0 : p.stock);
        tr.appendChild(tdNombre);
        tr.appendChild(tdStock);
        tbody.appendChild(tr);
    });
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


document.getElementById('eliminarProducto').addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('#tablaProductos tbody input[type="checkbox"]:checked');
    const idsAEliminar = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);

    if (idsAEliminar.length > 0) {
        try {
            for (const id of idsAEliminar) {
                await db.collection('productos').doc(id).delete();
            }
            alert('Productos eliminados correctamente.');
        } catch (error) {
            alert('Error al eliminar productos: ' + error.message);
        }
    } else {
        alert('Por favor, selecciona al menos un producto para eliminar.');
    }
});

    
// Escuchar cambios en Firestore en tiempo real
db.collection('productos').onSnapshot(snapshot => {
    productos = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        productos.push({
            id: doc.id,
            nombre: data.nombre,
            precio: data.precio,
            stock: data.stock
        });
    });
    actualizarListaProductos();
});
