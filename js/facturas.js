// ==============================
// Variables globales
// ==============================
let clientes = [];
let productos = [];
let facturas = [];
let clienteSeleccionado = null;
let carrito = [];

// ==============================
// Cargar facturas
// ==============================
function cargarFacturas() {
    db.collection('facturas').onSnapshot(snapshot => {
        facturas = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            facturas.push({
                id: doc.id,
                cliente: data.cliente,
                fecha: data.fecha,
                monto: data.monto,
                productos: data.productos
            });
        });
        mostrarFacturas();
    });
}

function mostrarFacturas(filtro = '') {
    const tbody = document.querySelector('#tabla-facturas tbody');
    tbody.innerHTML = '';
    if (filtro.trim() === '') return;
    facturas.forEach(factura => {
        const nombreCompleto = (factura.cliente?.nombre || '') + ' ' + (factura.cliente?.apellido || '');
        if (nombreCompleto.toLowerCase().includes(filtro.toLowerCase())) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nombreCompleto}</td>
                <td>${factura.fecha}</td>
                <td>$${Number(factura.monto).toFixed(2)}</td>
                <td>${factura.productos.map(p => `${p.nombre} ($${Number(p.precio).toFixed(2)} x${p.cantidad})`).join(', ')}</td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// ==============================
// Cargar clientes
// ==============================
function cargarClientes() {
    db.collection('clientes').onSnapshot(snapshot => {
        clientes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            clientes.push({
                id: doc.id,
                nombre: data.nombre,
                apellido: data.apellido,
                celular: data.celular
            });
        });
        mostrarClientes(document.getElementById('busqueda-cliente').value);
    });
}

function mostrarClientes(filtro = '') {
    const tbody = document.querySelector('#tabla-clientes tbody');
    tbody.innerHTML = '';
    if (filtro.trim() === '') return;
    clientes.forEach(cliente => {
        const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`;
        if (
            nombreCompleto.toLowerCase().includes(filtro.toLowerCase()) ||
            cliente.celular?.toLowerCase().includes(filtro.toLowerCase())
        ) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="radio" name="cliente-select" data-id="${cliente.id}"></td>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellido}</td>
                <td>${cliente.celular}</td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// ==============================
// Cargar productos
// ==============================
function cargarProductos() {
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
        mostrarProductos(document.getElementById('busqueda-producto').value);
    });
}

function mostrarProductos(filtro = '') {
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '';
    if (filtro.trim() === '') return;
    productos.forEach(producto => {
        if (producto.nombre?.toLowerCase().includes(filtro.toLowerCase())) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" data-id="${producto.id}" data-precio="${producto.precio}" data-nombre="${producto.nombre}" data-stock="${producto.stock}"></td>
                <td>${producto.nombre}</td>
                <td>$${Number(producto.precio).toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td><input type="number" min="1" max="${producto.stock}" value="1" class="cantidad-producto" data-id="${producto.id}" style="width:60px;"></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// ==============================
// Carrito
// ==============================
function actualizarCarrito() {
    const tbody = document.querySelector('#tabla-carrito tbody');
    tbody.innerHTML = '';
    let total = 0;
    carrito.forEach((item, idx) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${Number(item.precio).toFixed(2)}</td>
            <td>${item.cantidad}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button type="button" class="quitar-producto" data-idx="${idx}">Quitar</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('carrito-total').textContent = total.toFixed(2);
}

// ==============================
// Eventos
// ==============================
window.addEventListener('DOMContentLoaded', () => {
    cargarFacturas();
    cargarClientes();
    cargarProductos();

    // Buscar clientes
    document.getElementById('busqueda-cliente').addEventListener('input', function() {
        mostrarClientes(this.value);
    });

    // Selección de cliente
    document.querySelector('#tabla-clientes tbody').addEventListener('change', function(e) {
        if (e.target.name === 'cliente-select') {
            clienteSeleccionado = clientes.find(c => c.id === e.target.dataset.id);
        }
    });

    // Formulario nuevo cliente
    document.getElementById('btn-nuevo-cliente').addEventListener('click', () => {
        document.getElementById('form-nuevo-cliente').style.display = 'block';
    });
    document.getElementById('cancelar-cliente').addEventListener('click', () => {
        document.getElementById('form-nuevo-cliente').style.display = 'none';
    });
    document.getElementById('form-nuevo-cliente-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nuevo-nombre').value.trim();
        const apellido = document.getElementById('nuevo-apellido').value.trim();
        const celular = document.getElementById('nuevo-celular').value.trim();
        if (nombre && apellido && celular) {
            await db.collection('clientes').add({ nombre, apellido, celular });
            document.getElementById('form-nuevo-cliente').style.display = 'none';
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-apellido').value = '';
            document.getElementById('nuevo-celular').value = '';
        }
    });

    // Buscar productos
    document.getElementById('busqueda-producto').addEventListener('input', function() {
        mostrarProductos(this.value);
    });

    // Manejo de productos (checkbox y cantidad)
    document.querySelector('#tabla-productos tbody').addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const cb = e.target;
            const id = cb.dataset.id;
            const nombre = cb.dataset.nombre;
            const precio = parseFloat(cb.dataset.precio);
            const stock = parseInt(cb.dataset.stock);
            const cantidadInput = document.querySelector(`input.cantidad-producto[data-id='${id}']`);
            let cantidad = parseInt(cantidadInput?.value) || 1;
            if (cantidad < 1) cantidad = 1;
            if (cantidad > stock) cantidad = stock;

            if (cb.checked) {
                if (!carrito.some(p => p.id === id)) {
                    carrito.push({ id, nombre, precio, cantidad, stock });
                }
            } else {
                carrito = carrito.filter(p => p.id !== id);
            }
            actualizarCarrito();
        }

        if (e.target.classList.contains('cantidad-producto')) {
            const id = e.target.dataset.id;
            let cantidad = parseInt(e.target.value) || 1;
            const producto = carrito.find(p => p.id === id);
            if (producto) {
                if (cantidad < 1) cantidad = 1;
                if (cantidad > producto.stock) cantidad = producto.stock;
                producto.cantidad = cantidad;
            }
            actualizarCarrito();
        }
    });

    // Quitar producto del carrito
    document.getElementById('tabla-carrito').addEventListener('click', function(e) {
        if (e.target.classList.contains('quitar-producto')) {
            const idx = parseInt(e.target.dataset.idx);
            if (!isNaN(idx)) {
                const id = carrito[idx].id;
                carrito.splice(idx, 1);
                const cb = document.querySelector(`#tabla-productos tbody input[type='checkbox'][data-id='${id}']`);
                if (cb) cb.checked = false;
                actualizarCarrito();
            }
        }
    });

    // Guardar factura
    document.getElementById('guardar-factura').addEventListener('click', async function() {
        if (!clienteSeleccionado) {
            document.getElementById('mensaje-factura').textContent = 'Selecciona un cliente.';
            return;
        }
        if (carrito.length === 0) {
            document.getElementById('mensaje-factura').textContent = 'Agrega productos al carrito.';
            return;
        }

        // Validar stock
        for (const p of carrito) {
            if (p.cantidad > p.stock) {
                document.getElementById('mensaje-factura').textContent = `Stock insuficiente para ${p.nombre}`;
                return;
            }
        }

        const productosFactura = carrito.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            cantidad: p.cantidad
        }));
        const fecha = new Date().toLocaleString();
        const monto = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

        await db.collection('facturas').add({
            cliente: clienteSeleccionado,
            productos: productosFactura,
            fecha,
            monto: parseFloat(monto)
        });

        // Restar stock
        for (const p of carrito) {
            const nuevoStock = p.stock - p.cantidad;
            await db.collection('productos').doc(p.id).update({ stock: nuevoStock });
        }

        document.getElementById('mensaje-factura').textContent = 'Factura guardada correctamente.';

        // Reset
        document.querySelectorAll('#tabla-productos tbody input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('#tabla-productos tbody input.cantidad-producto').forEach(input => input.value = 1);
        document.querySelectorAll('#tabla-clientes tbody input[type="radio"]').forEach(cb => cb.checked = false);

        clienteSeleccionado = null;
        carrito = [];
        actualizarCarrito();

        setTimeout(() => {
            document.getElementById('mensaje-factura').textContent = '';
        }, 2000);
    });

    // Buscar facturas por cliente
    document.getElementById('busqueda-factura-cliente').addEventListener('input', function() {
        mostrarFacturas(this.value);
    });
});
