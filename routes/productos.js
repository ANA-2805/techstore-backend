const router   = require('express').Router();
const Producto = require('../models/Producto');

// GET /productos — Consultar todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true }).sort({ nombre: 1 });
    res.json(productos);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// GET /productos/stock-bajo — Productos con stock menor a 5
router.get('/stock-bajo', async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true, stock: { $lt: 5 } }).sort({ stock: 1 });
    res.json(productos);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// POST /productos — Registrar producto
router.post('/', async (req, res) => {
  try {
    const { nombre, categoria, precio, stock, descripcion } = req.body;
    if (!nombre || precio === undefined)
      return res.status(400).json({ message: 'Nombre y precio son obligatorios.' });
    const producto = await Producto.create({ nombre, categoria, precio, stock, descripcion });
    res.status(201).json(producto);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// PUT /productos/:id — Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json(producto);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// DELETE /productos/:id — Eliminar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado.' });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
