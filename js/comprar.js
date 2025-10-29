// Variables globales
let productos = [];
let productosBajoStock = [];
let productosManualesTotales = [];

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 3000);
}

// Función para cargar productos con bajo stock
function cargarProductosBajoStock() {
    const tablaBody = document.querySelector('#tablaComprar tbody');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const alertaStock = document.getElementById('alertaStock');
    const resumenCompra = document.getElementById('resumenCompra');
    
    tablaBody.innerHTML = '';
    
    // Filtrar productos con stock menor a 5
    productosBajoStock = productos.filter(producto => {
        const stock = parseInt(producto.stock) || 0;
        return stock < 5;
    });

    if (productosBajoStock.length === 0) {
        // No hay productos con bajo stock
        document.getElementById('tablaComprar').style.display = 'none';
        mensajeVacio.style.display = 'block';
        alertaStock.style.display = 'none';
        resumenCompra.style.display = 'none';
        return;
    }

    // Mostrar tabla y ocultar mensaje vacío
    document.getElementById('tablaComprar').style.display = 'table';
    mensajeVacio.style.display = 'none';
    alertaStock.style.display = 'block';
    resumenCompra.style.display = 'block';

    let totalProductos = 0;
    let totalInversion = 0;

    // Ordenar productos por stock ascendente (más críticos primero)
    productosBajoStock.sort((a, b) => {
        const stockA = parseInt(a.stock) || 0;
        const stockB = parseInt(b.stock) || 0;
        return stockA - stockB;
    });

    productosBajoStock.forEach(producto => {
        const fila = document.createElement('tr');
        
        const stock = parseInt(producto.stock) || 0;
        
        // Calcular cantidad sugerida (llevar a 10 unidades mínimo)
        const cantidadSugerida = Math.max(10 - stock, 1);
        
        totalProductos++;

        // Determinar estado del stock
        let estado = '';
        let claseEstado = '';
        if (stock === 0) {
            estado = 'SIN STOCK';
            claseEstado = 'estado-critico';
        } else if (stock <= 2) {
            estado = 'CRÍTICO';
            claseEstado = 'estado-critico';
        } else {
            estado = 'BAJO';
            claseEstado = 'estado-bajo';
        }

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td class="${claseEstado}">${stock}</td>
            <td class="${claseEstado}">${estado}</td>
            <td>
                <input type="number" class="cantidad-input" value="${cantidadSugerida}" min="1" data-producto-id="${producto.id}">
            </td>
            <td>
                <input type="number" class="precio-compra-input" placeholder="0.00" min="0.01" step="0.01" data-producto-id="${producto.id}">
            </td>
            <td class="total-producto">
                <strong>$0.00</strong>
            </td>
        `;

        // Añadir clase especial para productos sin stock
        if (stock === 0) {
            fila.classList.add('producto-sin-stock');
        } else if (stock <= 2) {
            fila.classList.add('producto-critico');
        }

        tablaBody.appendChild(fila);
    });

    // Actualizar resumen inicial (sin cálculos hasta que se presione el botón)
    actualizarContadorProductos();
    document.getElementById('totalInversion').textContent = '$0.00';
}

// Función para calcular totales
function calcularTotales() {
    let totalInversion = 0;
    let productosConPrecio = 0;
    let hayErrores = false;
    
    // Obtener todas las filas de productos
    const filas = document.querySelectorAll('#tablaComprar tbody tr');
    
    filas.forEach(fila => {
        const cantidadInput = fila.querySelector('.cantidad-input');
        const precioInput = fila.querySelector('.precio-compra-input');
        const totalCelda = fila.querySelector('.total-producto strong');
        
        const cantidad = parseInt(cantidadInput.value) || 0;
        const precio = parseFloat(precioInput.value) || 0;
        
        if (precio > 0 && cantidad > 0) {
            const total = cantidad * precio;
            totalCelda.textContent = `$${total.toFixed(2)}`;
            totalInversion += total;
            productosConPrecio++;
            
            // Remover clase de error si existía
            precioInput.classList.remove('input-error');
        } else {
            totalCelda.textContent = '$0.00';
            if (precio <= 0) {
                precioInput.classList.add('input-error');
                hayErrores = true;
            }
        }
    });
    
    // Actualizar resumen
    document.getElementById('totalInversion').textContent = `$${totalInversion.toFixed(2)}`;
    
    if (hayErrores) {
        mostrarNotificacion('Complete todos los precios de compra para obtener el cálculo exacto.');
    } else if (productosConPrecio > 0) {
        mostrarNotificacion(`Cálculo completado: ${productosConPrecio} productos calculados.`);
    } else {
        mostrarNotificacion('Ingrese los precios de compra para calcular los totales.');
    }
}

// Función para agregar producto manual a la tabla
function agregarProductoManual(nombre, precio, cantidad) {
    const tablaBody = document.querySelector('#tablaComprar tbody');
    const fila = document.createElement('tr');
    
    // Agregar clase especial para productos manuales
    fila.classList.add('producto-manual');
    
    // Generar ID único para el producto manual
    const idManual = 'manual_' + Date.now();
    
    fila.innerHTML = `
        <td>
            <span class="producto-manual-icono">📝</span> ${nombre}
            <button type="button" class="btn-eliminar-manual" data-id="${idManual}" title="Eliminar producto manual">×</button>
        </td>
        <td class="estado-manual">MANUAL</td>
        <td class="estado-manual">AGREGADO</td>
        <td>
            <input type="number" class="cantidad-input" value="${cantidad}" min="1" data-producto-id="${idManual}">
        </td>
        <td>
            <input type="number" class="precio-compra-input" value="${precio}" min="0.01" step="0.01" data-producto-id="${idManual}">
        </td>
        <td class="total-producto">
            <strong>$0.00</strong>
        </td>
    `;
    
    tablaBody.appendChild(fila);
    
    // Guardar en el array de productos manuales
    productosManualesTotales.push({
        id: idManual,
        nombre: nombre,
        precio: precio,
        cantidad: cantidad
    });
    
    // Mostrar tabla y ocultar mensaje vacío si estaba visible
    document.getElementById('tablaComprar').style.display = 'table';
    document.getElementById('mensajeVacio').style.display = 'none';
    document.getElementById('resumenCompra').style.display = 'block';
    
    // Actualizar contador de productos
    actualizarContadorProductos();
}

// Función para actualizar el contador de productos en el resumen
function actualizarContadorProductos() {
    const totalAutomaticos = productosBajoStock.length;
    const totalManuales = productosManualesTotales.length;
    const totalProductos = totalAutomaticos + totalManuales;
    
    document.getElementById('totalProductos').textContent = totalProductos;
}

// Event listeners
document.getElementById('btnRefrescar').addEventListener('click', function() {
    mostrarNotificacion('Actualizando lista de productos...');
    // La lista se actualiza automáticamente con el listener de Firestore
});

document.getElementById('btnCalcular').addEventListener('click', calcularTotales);

// Event listener para el formulario de agregar productos manuales
document.getElementById('formAgregarProducto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreManual').value.trim();
    const precio = parseFloat(document.getElementById('precioManual').value);
    const cantidad = parseInt(document.getElementById('cantidadManual').value);
    
    if (nombre && precio > 0 && cantidad > 0) {
        agregarProductoManual(nombre, precio, cantidad);
        
        // Limpiar formulario
        document.getElementById('formAgregarProducto').reset();
        
        mostrarNotificacion(`Producto "${nombre}" agregado a la lista de compras.`);
    } else {
        mostrarNotificacion('Por favor, complete todos los campos correctamente.');
    }
});

// Event listener para limpiar formulario
document.getElementById('btnLimpiarForm').addEventListener('click', function() {
    document.getElementById('formAgregarProducto').reset();
});

// Event listener para eliminar productos manuales
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-eliminar-manual')) {
        const idManual = e.target.getAttribute('data-id');
        const fila = e.target.closest('tr');
        
        // Eliminar del array
        productosManualesTotales = productosManualesTotales.filter(p => p.id !== idManual);
        
        // Eliminar de la tabla
        fila.remove();
        
        // Actualizar contador
        actualizarContadorProductos();
        
        // Verificar si hay que mostrar mensaje vacío
        const totalFilas = document.querySelectorAll('#tablaComprar tbody tr').length;
        if (totalFilas === 0) {
            document.getElementById('tablaComprar').style.display = 'none';
            document.getElementById('mensajeVacio').style.display = 'block';
            document.getElementById('alertaStock').style.display = 'none';
            document.getElementById('resumenCompra').style.display = 'none';
        }
        
        // Recalcular totales
        calcularTotales();
        
        mostrarNotificacion('Producto eliminado de la lista.');
    }
});

// Agregar event listeners para cálculo automático al presionar Enter
document.addEventListener('keypress', function(e) {
    if (e.target.classList.contains('cantidad-input') || e.target.classList.contains('precio-compra-input')) {
        if (e.key === 'Enter') {
            calcularTotales();
        }
    }
});

document.getElementById('btnImprimir').addEventListener('click', function() {
    // Verificar si hay cálculos realizados
    const totalInversion = document.getElementById('totalInversion').textContent;
    if (totalInversion === '$0.00') {
        mostrarNotificacion('Primero calcule los totales antes de imprimir.');
        return;
    }
    
    // Crear tabla para impresión con los valores calculados
    let tablaImpresion = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
    tablaImpresion += '<thead><tr>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Producto</th>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Stock Actual</th>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Estado</th>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Cantidad</th>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Precio Compra</th>';
    tablaImpresion += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Total</th>';
    tablaImpresion += '</tr></thead><tbody>';
    
    // Obtener datos calculados de la tabla
    const filas = document.querySelectorAll('#tablaComprar tbody tr');
    filas.forEach(fila => {
        const celdas = fila.children;
        const cantidadInput = fila.querySelector('.cantidad-input');
        const precioInput = fila.querySelector('.precio-compra-input');
        const totalCelda = fila.querySelector('.total-producto strong');
        
        // Obtener el texto del producto (limpiar iconos y botones para impresión)
        let nombreProducto = celdas[0].textContent.replace('×', '').trim();
        if (fila.classList.contains('producto-manual')) {
            nombreProducto = nombreProducto.replace('📝', '').trim();
        }
        
        tablaImpresion += '<tr>';
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">${nombreProducto}</td>`;
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">${celdas[1].textContent}</td>`;
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">${celdas[2].textContent}</td>`;
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">${cantidadInput.value}</td>`;
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">$${parseFloat(precioInput.value || 0).toFixed(2)}</td>`;
        tablaImpresion += `<td style="border: 1px solid #ddd; padding: 8px;">${totalCelda.textContent}</td>`;
        tablaImpresion += '</tr>';
    });
    
    tablaImpresion += '</tbody></table>';
    
    const contenidoImpresion = `
        <html>
        <head>
            <title>Lista de Compras - Productos con Bajo Stock</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1976d2; text-align: center; }
                .estado-critico { color: #d32f2f; font-weight: bold; }
                .estado-bajo { color: #ff9800; font-weight: bold; }
                .resumen { margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; }
                .fecha { text-align: right; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>Lista de Compras - Productos con Bajo Stock</h1>
            ${tablaImpresion}
            ${document.getElementById('resumenCompra').outerHTML}
            <div class="fecha">Generado el: ${new Date().toLocaleString('es-ES')}</div>
        </body>
        </html>
    `;
    
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(contenidoImpresion);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
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
    cargarProductosBajoStock();
}, error => {
    console.error('Error al cargar productos:', error);
    mostrarNotificacion('Error al cargar los productos. Revise su conexión.');
});

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarNotificacion('Cargando productos con bajo stock...');
});