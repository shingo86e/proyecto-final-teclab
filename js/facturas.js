document.getElementById('formFactura').addEventListener('submit', function(e) {
    e.preventDefault();
    const cliente = document.getElementById('cliente').value;
    const producto = document.getElementById('producto').value;
    const cantidad = document.getElementById('cantidad').value;
    const factura = { cliente, producto, cantidad, fecha: new Date().toLocaleString() };

    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas.push(factura);
    localStorage.setItem('facturas', JSON.stringify(facturas));

    mostrarFacturas();
    this.reset();
});

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
let idFactura = facturas.length > 0 ? facturas[facturas.length - 1].id + 1 : 1;

let clienteSeleccionado = null;
let productosSeleccionados = [];

// Filtrar y mostrar clientes en la tabla para seleccionar
document.getElementById('buscarCliente').addEventListener('input', function() {
    mostrarClientesFactura(this.value.toLowerCase());
});

function mostrarClientesFactura(filtro = '') {
    clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const tbody = document.querySelector('#tablaClientesFactura tbody');
    tbody.innerHTML = '';
    if (!filtro) return;
    let coincidencias = 0;
    clientes.forEach((c, idx) => {
        let texto = `${c.nombre} ${c.apellido} ${c.celular || ''}`.toLowerCase();
        if (texto.includes(filtro)) {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.apellido}</td>
                <td>${c.celular || ''}</td>
                <td><button type="button" onclick="seleccionarCliente(${idx})">Seleccionar</button></td>
            `;
            tbody.appendChild(fila);
            coincidencias++;
        }
    });
    if (coincidencias === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan='5' style='text-align:center;color:#f44336;'>No se encontraron clientes</td>`;
        tbody.appendChild(fila);
    }
}

window.seleccionarCliente = function(idx) {
    clienteSeleccionado = clientes[idx];
    document.getElementById('nombreCliente').value = clienteSeleccionado.nombre;
    document.getElementById('apellidoCliente').value = clienteSeleccionado.apellido;
    document.getElementById('celularCliente').value = clienteSeleccionado.celular;
}

// Filtrar y mostrar productos en la tabla para seleccionar
document.getElementById('buscarProducto').addEventListener('input', function() {
    mostrarProductosFactura(this.value.toLowerCase());
});

function mostrarProductosFactura(filtro = '') {
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    const tbody = document.querySelector('#tablaProductosFactura tbody');
    tbody.innerHTML = '';
    if (!filtro) return;
    let coincidencias = 0;
    productos.forEach((p, idx) => {
        if (p.nombre.toLowerCase().includes(filtro)) {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td><button type="button" onclick="agregarProductoFactura(${idx})">Agregar</button></td>
            `;
            tbody.appendChild(fila);
            coincidencias++;
        }
    });
    if (coincidencias === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan='5' style='text-align:center;color:#f44336;'>No se encontraron productos</td>`;
        tbody.appendChild(fila);
    }
}

window.agregarProductoFactura = function(idx) {
    const producto = productos[idx];
    const cantidad = prompt(`Cantidad a vender de ${producto.nombre} (stock disponible: ${producto.stock}):`, '1');
    const cantidadNum = parseInt(cantidad);
    if (!isNaN(cantidadNum) && cantidadNum > 0 && cantidadNum <= producto.stock) {
        productosSeleccionados.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidadNum
        });
        mostrarDetalleVenta();
    } else {
        alert('Cantidad inválida o mayor al stock disponible.');
    }
}

function mostrarDetalleVenta() {
    const div = document.getElementById('detalleVenta');
    div.innerHTML = '';
    if (productosSeleccionados.length === 0) {
        div.textContent = 'No hay productos seleccionados.';
        return;
    }
    let total = 0;
    const tabla = document.createElement('table');
    tabla.className = 'tabla-productos';
    tabla.innerHTML = `
        <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Quitar</th></tr></thead>
        <tbody></tbody>
    `;
    productosSeleccionados.forEach((prod, idx) => {
        const subtotal = prod.precio * prod.cantidad;
        total += subtotal;
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${prod.nombre}</td>
            <td>$${prod.precio}</td>
            <td>${prod.cantidad}</td>
            <td>$${subtotal}</td>
            <td><button type="button" onclick="quitarProductoFactura(${idx})">Quitar</button></td>
        `;
        tabla.querySelector('tbody').appendChild(fila);
    });
    div.appendChild(tabla);
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<strong>Total: $${total}</strong>`;
    div.appendChild(totalDiv);
}

window.quitarProductoFactura = function(idx) {
    productosSeleccionados.splice(idx, 1);
    mostrarDetalleVenta();
}

document.getElementById('formFactura').addEventListener('submit', function(e) {
    e.preventDefault();
    // Validar cliente
    const nombre = document.getElementById('nombreCliente').value.trim();
    const apellido = document.getElementById('apellidoCliente').value.trim();
    const celular = document.getElementById('celularCliente').value.trim();
    if (!nombre || !apellido) {
        alert('Completa nombre y apellido del cliente.');
        return;
    }
    if (productosSeleccionados.length === 0) {
        alert('Agrega al menos un producto a la factura.');
        return;
    }
    // Guardar cliente si es nuevo
    let clienteFactura = clienteSeleccionado;
    if (!clienteFactura || clienteFactura.nombre !== nombre || clienteFactura.apellido !== apellido) {
        clienteFactura = {
            id: clientes.length > 0 ? clientes[clientes.length - 1].id + 1 : 1,
            nombre,
            apellido,
            celular
        };
        clientes.push(clienteFactura);
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }
    // Guardar factura
    const fecha = new Date().toLocaleString();
    let total = productosSeleccionados.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
    const factura = {
        id: idFactura,
        fecha,
        cliente: clienteFactura,
        productos: [...productosSeleccionados],
        total
    };
    facturas.push(factura);
    idFactura++;
    localStorage.setItem('facturas', JSON.stringify(facturas));
    mostrarFacturas();
    productosSeleccionados = [];
    mostrarDetalleVenta();
    this.reset();
    clienteSeleccionado = null;
});

function mostrarFacturas() {
    facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const tbody = document.querySelector('#tablaFacturas tbody');
    tbody.innerHTML = '';
    facturas.forEach(f => {
        const productosTxt = f.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ');
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${f.id}</td>
            <td>${f.fecha}</td>
            <td>${f.cliente.nombre} ${f.cliente.apellido}</td>
            <td>${productosTxt}</td>
            <td>$${f.total}</td>
        `;
        tbody.appendChild(fila);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    mostrarClientesFactura();
    mostrarProductosFactura();
    mostrarFacturas();
    mostrarDetalleVenta();
});
