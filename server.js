const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const productosPath = path.join(__dirname, 'JSON', 'productos.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.get('/productos', (req, res) => {
  fs.readFile(productosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer productos.json' });
    try {
      const productos = JSON.parse(data);
      res.json(productos);
    } catch {
      res.status(500).json({ error: 'Error al parsear productos.json' });
    }
  });
});

app.post('/productos', (req, res) => {
  const nuevoProducto = req.body;

  fs.readFile(productosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer productos.json' });

    let productos = [];
    try {
      productos = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: 'Error al parsear productos.json' });
    }

    productos.push(nuevoProducto);

    fs.writeFile(productosPath, JSON.stringify(productos, null, 2), 'utf8', err => {
      if (err) return res.status(500).json({ error: 'Error al guardar productos.json' });
      res.json({ message: 'Producto guardado correctamente' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
