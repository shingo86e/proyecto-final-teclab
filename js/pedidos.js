// Referencias a elementos del DOM
const filtroEstado = document.getElementById('filtroEstado');
const actualizarPedidos = document.getElementById('actualizarPedidos');
const loadingPedidos = document.getElementById('loadingPedidos');
const noPedidos = document.getElementById('noPedidos');
const pedidosContainer = document.getElementById('pedidosContainer');
const notificacion = document.getElementById('notificacion');
const mensajeNotificacion = document.getElementById('mensajeNotificacion');

// Contadores de estadísticas
const pendientesCount = document.getElementById('pendientesCount');
const preparadosCount = document.getElementById('preparadosCount');
const entregadosCount = document.getElementById('entregadosCount');

// Variables globales
let todosLosPedidos = [];
let pedidosFiltrados = [];

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-danger';
    
    notificacion.className = `alert ${alertClass} alert-dismissible fade show`;
    mensajeNotificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 150);
    }, 4000);
}

// Función para cargar pedidos desde Firebase
async function cargarPedidos() {
    try {
        console.log('Cargando pedidos desde Firebase...');
        loadingPedidos.style.display = 'block';
        pedidosContainer.style.display = 'none';
        noPedidos.style.display = 'none';

        // Obtener todos los pedidos del ecommerce
        const snapshot = await db.collection('pedidos-ecommerce').orderBy('fechaPedido', 'desc').get();
        
        todosLosPedidos = [];
        snapshot.forEach((doc) => {
            const pedido = {
                id: doc.id,
                ...doc.data()
            };
            
            // Convertir timestamps de Firestore
            if (pedido.fechaPedido && pedido.fechaPedido.seconds) {
                pedido.fechaPedido = new Date(pedido.fechaPedido.seconds * 1000);
            }
            if (pedido.fechaActualizacion && pedido.fechaActualizacion.seconds) {
                pedido.fechaActualizacion = new Date(pedido.fechaActualizacion.seconds * 1000);
            }

            todosLosPedidos.push(pedido);
        });

        console.log(`Pedidos cargados: ${todosLosPedidos.length}`);
        
        // Limpiar pedidos antiguos entregados
        await limpiarPedidosAntiguos();
        
        // Aplicar filtros y mostrar
        aplicarFiltros();
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error cargando pedidos:', error);
        mostrarNotificacion('Error al cargar pedidos: ' + error.message, 'error');
        mostrarSinPedidos();
    } finally {
        loadingPedidos.style.display = 'none';
    }
}

// Función para limpiar pedidos entregados hace más de 24 horas
async function limpiarPedidosAntiguos() {
    const ahora = new Date();
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    for (const pedido of todosLosPedidos) {
        if (pedido.estado === 'Entregado' && pedido.fechaActualizacion && pedido.fechaActualizacion < hace24Horas) {
            try {
                await db.collection('pedidos-ecommerce').doc(pedido.id).delete();
                console.log(`Pedido eliminado automáticamente: ${pedido.numeroPedido}`);
            } catch (error) {
                console.error('Error eliminando pedido antiguo:', error);
            }
        }
    }

    // Recargar después de limpiar
    todosLosPedidos = todosLosPedidos.filter(pedido => 
        pedido.estado !== 'Entregado' || 
        !pedido.fechaActualizacion || 
        pedido.fechaActualizacion >= hace24Horas
    );
}

// Función para aplicar filtros
function aplicarFiltros() {
    const estadoSeleccionado = filtroEstado.value;

    if (estadoSeleccionado) {
        pedidosFiltrados = todosLosPedidos.filter(pedido => pedido.estado === estadoSeleccionado);
    } else {
        pedidosFiltrados = [...todosLosPedidos];
    }

    mostrarPedidos();
}

// Función para mostrar pedidos
function mostrarPedidos() {
    if (pedidosFiltrados.length === 0) {
        mostrarSinPedidos();
        return;
    }

    pedidosContainer.innerHTML = '';
    pedidosContainer.style.display = 'block';
    noPedidos.style.display = 'none';

    pedidosFiltrados.forEach(pedido => {
        const pedidoCard = crearCardPedido(pedido);
        pedidosContainer.appendChild(pedidoCard);
    });
}

// Función para mostrar mensaje sin pedidos
function mostrarSinPedidos() {
    pedidosContainer.style.display = 'none';
    noPedidos.style.display = 'block';
}

// Función para crear card de pedido
function crearCardPedido(pedido) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';

    const estadoClass = {
        'Pendiente': 'bg-warning text-dark',
        'Preparado': 'bg-success text-white',
        'Entregado': 'bg-info text-white'
    };

    const estadoIcon = {
        'Pendiente': '⏳',
        'Preparado': '✅',
        'Entregado': '📋'
    };

    // Calcular total del pedido
    const total = pedido.productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    // Formatear fechas
    const fechaPedido = pedido.fechaPedido ? pedido.fechaPedido.toLocaleString('es-ES') : 'N/A';
    const fechaRetiro = pedido.fechaRetiro || 'No especificada';
    const horarioRetiro = pedido.horaRetiro || pedido.horarioRetiro || 'No especificado';
    
    // Datos del cliente con valores por defecto
    const nombreCompleto = `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim();
    const telefonoCliente = pedido.cliente.telefono || pedido.cliente.celular || 'No especificado';

    col.innerHTML = `
        <div class="card h-100">
            <div class="card-header ${estadoClass[pedido.estado] || 'bg-secondary text-white'} d-flex justify-content-between align-items-center">
                <strong>${estadoIcon[pedido.estado] || '📦'} ${pedido.numeroPedido}</strong>
                <span class="badge bg-light text-dark">${pedido.estado}</span>
            </div>
            <div class="card-body">
                <h6 class="card-title">👤 ${nombreCompleto || 'Cliente sin nombre'}</h6>
                <p class="card-text">
                    <small class="text-muted">📞 ${telefonoCliente}</small><br>
                    <small class="text-muted">📅 Pedido: ${fechaPedido}</small><br>
                    <small class="text-muted">🕒 Retiro: ${fechaRetiro} | ${horarioRetiro}</small>
                </p>
                
                <h6>📦 Productos:</h6>
                <ul class="list-unstyled" style="max-height: 150px; overflow-y: auto;">
                    ${pedido.productos.map(item => `
                        <li class="d-flex justify-content-between align-items-center mb-1">
                            <span>${item.nombre} (x${item.cantidad})</span>
                            <small>$${(item.precio * item.cantidad).toLocaleString()}</small>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="d-flex justify-content-between align-items-center">
                    <strong>Total: $${total.toLocaleString()}</strong>
                </div>
            </div>
            <div class="card-footer">
                ${crearBotonesEstado(pedido)}
            </div>
        </div>
    `;

    return col;
}

// Función para crear botones según el estado
function crearBotonesEstado(pedido) {
    const btnEliminar = `<button class="btn btn-outline-danger btn-sm" onclick="eliminarPedido('${pedido.id}', '${pedido.numeroPedido}')" title="Eliminar pedido permanentemente">🗑️</button>`;
    
    switch (pedido.estado) {
        case 'Pendiente':
            return `
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-success btn-sm" onclick="cambiarEstado('${pedido.id}', 'Preparado')">
                        ✅ Marcar como Preparado
                    </button>
                    ${btnEliminar}
                </div>
            `;
        case 'Preparado':
            return `
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-warning btn-sm" onclick="cambiarEstado('${pedido.id}', 'Pendiente')">
                        ⏳ Volver a Pendiente
                    </button>
                    <button class="btn btn-info btn-sm" onclick="cambiarEstado('${pedido.id}', 'Entregado')">
                        📋 Marcar como Entregado
                    </button>
                    ${btnEliminar}
                </div>
            `;
        case 'Entregado':
            return `
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-success btn-sm" disabled>
                        ✅ Pedido Entregado
                    </button>
                    ${btnEliminar}
                    <small class="text-muted d-block mt-1">Se eliminará automáticamente en 24h</small>
                </div>
            `;
        default:
            return `
                <div class="d-flex gap-2 align-items-center">
                    ${btnEliminar}
                </div>
            `;
    }
}

// Función para validar stock antes de entrega
async function validarStockParaEntrega(pedido) {
    try {
        const productosConStockInsuficiente = [];
        
        for (const producto of pedido.productos) {
            const productoRef = db.collection('productos').doc(producto.id);
            const productoDoc = await productoRef.get();
            
            if (productoDoc.exists) {
                const datosProducto = productoDoc.data();
                const stockActual = datosProducto.stock || 0;
                const cantidadSolicitada = producto.cantidad;
                
                if (stockActual < cantidadSolicitada) {
                    productosConStockInsuficiente.push({
                        nombre: producto.nombre,
                        stockActual: stockActual,
                        cantidadSolicitada: cantidadSolicitada,
                        diferencia: cantidadSolicitada - stockActual
                    });
                }
            } else {
                productosConStockInsuficiente.push({
                    nombre: producto.nombre,
                    stockActual: 0,
                    cantidadSolicitada: producto.cantidad,
                    diferencia: producto.cantidad,
                    noEncontrado: true
                });
            }
        }
        
        return productosConStockInsuficiente;
    } catch (error) {
        console.error('Error validando stock:', error);
        throw error;
    }
}

// Función para actualizar stock cuando se entrega un pedido
async function actualizarStockEntrega(pedido) {
    try {
        console.log('Actualizando stock para pedido:', pedido.numeroPedido);
        
        // Iterar sobre cada producto del pedido
        for (const producto of pedido.productos) {
            try {
                // Obtener el producto actual de la base de datos
                const productoRef = db.collection('productos').doc(producto.id);
                const productoDoc = await productoRef.get();
                
                if (productoDoc.exists) {
                    const datosProducto = productoDoc.data();
                    const stockActual = datosProducto.stock || 0;
                    const cantidadEntregada = producto.cantidad;
                    const nuevoStock = Math.max(0, stockActual - cantidadEntregada);
                    
                    console.log(`Producto: ${producto.nombre}`);
                    console.log(`Stock actual: ${stockActual}, Entregado: ${cantidadEntregada}, Nuevo stock: ${nuevoStock}`);
                    
                    // Actualizar el stock en Firebase
                    await productoRef.update({
                        stock: nuevoStock,
                        fechaUltimaActualizacion: new Date()
                    });
                    
                } else {
                    console.warn(`Producto no encontrado en stock: ${producto.id} - ${producto.nombre}`);
                }
            } catch (error) {
                console.error(`Error actualizando stock para producto ${producto.nombre}:`, error);
                // Continuar con el siguiente producto aunque uno falle
            }
        }
        
        console.log('Stock actualizado correctamente para todos los productos');
        return true;
        
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        throw error;
    }
}

// Función para eliminar un pedido manualmente
async function eliminarPedido(pedidoId, numeroPedido) {
    try {
        // Confirmación de eliminación
        const confirmacion = confirm(
            `⚠️ ELIMINAR PEDIDO\n\n` +
            `¿Estás seguro de que quieres ELIMINAR el pedido ${numeroPedido}?\n\n` +
            `⚠️ ADVERTENCIA: Esta acción NO SE PUEDE DESHACER\n\n` +
            `• El pedido se eliminará permanentemente\n` +
            `• NO se actualizará el stock automáticamente\n` +
            `• Si ya se entregó, debes ajustar el stock manualmente\n\n` +
            `Escribe "ELIMINAR" para confirmar:`
        );

        if (!confirmacion) return;

        // Segunda confirmación para estar seguros
        const confirmacionFinal = prompt(
            `Confirmación final:\n\nPara eliminar el pedido ${numeroPedido}, escribe exactamente: ELIMINAR`
        );

        if (confirmacionFinal !== 'ELIMINAR') {
            mostrarNotificacion('Eliminación cancelada - Confirmación incorrecta', 'error');
            return;
        }

        mostrarNotificacion('Eliminando pedido...', 'success');

        // Eliminar de Firebase
        await db.collection('pedidos-ecommerce').doc(pedidoId).delete();

        // Eliminar del array local
        todosLosPedidos = todosLosPedidos.filter(p => p.id !== pedidoId);

        mostrarNotificacion(`✅ Pedido ${numeroPedido} eliminado correctamente`, 'success');

        // Recargar vista
        aplicarFiltros();
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        mostrarNotificacion('❌ Error al eliminar pedido: ' + error.message, 'error');
    }
}

// Función para cambiar estado de pedido
window.cambiarEstado = async function(pedidoId, nuevoEstado) {
    try {
        const pedido = todosLosPedidos.find(p => p.id === pedidoId);
        
        if (!pedido) {
            mostrarNotificacion('Pedido no encontrado', 'error');
            return;
        }

        // Mensaje de confirmación especial para entrega
        let mensajeConfirmacion;
        if (nuevoEstado === 'Entregado') {
            mensajeConfirmacion = `¿Confirmar ENTREGA del pedido ${pedido.numeroPedido}?\n\n⚠️ IMPORTANTE: Esto actualizará el stock automáticamente restando los productos entregados.\n\nProductos a descontar del stock:\n${pedido.productos.map(p => `• ${p.nombre}: ${p.cantidad} unidades`).join('\n')}`;
        } else {
            mensajeConfirmacion = `¿Cambiar estado del pedido ${pedido.numeroPedido} a "${nuevoEstado}"?`;
        }

        const confirmacion = confirm(mensajeConfirmacion);
        if (!confirmacion) return;

        // Si se está marcando como entregado, validar y actualizar stock
        if (nuevoEstado === 'Entregado') {
            try {
                // Validar stock disponible
                mostrarNotificacion('Validando stock disponible...', 'success');
                const productosConProblemas = await validarStockParaEntrega(pedido);
                
                if (productosConProblemas.length > 0) {
                    let mensajeError = '⚠️ PROBLEMA DE STOCK:\n\n';
                    productosConProblemas.forEach(p => {
                        if (p.noEncontrado) {
                            mensajeError += `• ${p.nombre}: Producto no encontrado en inventario\n`;
                        } else {
                            mensajeError += `• ${p.nombre}: Stock actual (${p.stockActual}) menor que solicitado (${p.cantidadSolicitada})\n`;
                        }
                    });
                    mensajeError += '\n¿Desea continuar con la entrega de todas formas?';
                    
                    const continuarConProblemas = confirm(mensajeError);
                    if (!continuarConProblemas) return;
                }
                
                // Actualizar stock
                mostrarNotificacion('Actualizando stock...', 'success');
                await actualizarStockEntrega(pedido);
                mostrarNotificacion('✅ Stock actualizado correctamente', 'success');
                
            } catch (error) {
                console.error('Error al validar/actualizar stock:', error);
                mostrarNotificacion('❌ Error al actualizar stock. ¿Continuar con la entrega?', 'error');
                const continuarEntrega = confirm('Hubo un error al actualizar el stock. ¿Desea marcar el pedido como entregado de todas formas?');
                if (!continuarEntrega) return;
            }
        }

        // Actualizar en Firebase
        await db.collection('pedidos-ecommerce').doc(pedidoId).update({
            estado: nuevoEstado,
            fechaActualizacion: new Date()
        });

        // Actualizar localmente
        pedido.estado = nuevoEstado;
        pedido.fechaActualizacion = new Date();

        let mensaje = `Pedido ${pedido.numeroPedido} actualizado a ${nuevoEstado}`;
        if (nuevoEstado === 'Entregado') {
            mensaje += ' 📦 Stock actualizado automáticamente';
        }
        
        mostrarNotificacion(mensaje, 'success');
        
        // Recargar vista
        aplicarFiltros();
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error cambiando estado:', error);
        mostrarNotificacion('Error al cambiar estado: ' + error.message, 'error');
    }
}

// Función para actualizar estadísticas
function actualizarEstadisticas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const pendientes = todosLosPedidos.filter(p => p.estado === 'Pendiente').length;
    const preparados = todosLosPedidos.filter(p => p.estado === 'Preparado').length;
    const entregadosHoy = todosLosPedidos.filter(p => 
        p.estado === 'Entregado' && 
        p.fechaActualizacion && 
        p.fechaActualizacion >= hoy
    ).length;

    pendientesCount.textContent = pendientes;
    preparadosCount.textContent = preparados;
    entregadosCount.textContent = entregadosHoy;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();

    filtroEstado.addEventListener('change', aplicarFiltros);
    actualizarPedidos.addEventListener('click', cargarPedidos);

    // Auto-actualizar cada 30 segundos
    setInterval(cargarPedidos, 30000);
});

// Exponer función eliminarPedido al scope global para los botones
window.eliminarPedido = eliminarPedido;