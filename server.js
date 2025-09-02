// filepath: d:\TECLAB\trabajo final\gestion-ventas\server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const productosPath = path.join(__dirname, 'JSON', 'productos.json');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos

// Ruta para obtener productos
app.get('/productos', (req, res) => {
    fs.readFile(productosPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de productos' });
        }
        res.json(JSON.parse(data));
    });
});

// Ruta para guardar productos
app.post('/productos', (req, res) => {
    const productos = req.body;
    fs.writeFile(productosPath, JSON.stringify(productos, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar los productos' });
        }
        res.json({ message: 'Productos guardados correctamente' });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});