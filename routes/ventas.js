const router   = require('express').Router();
const Venta    = require('../models/Venta');
const Producto = require('../models/Producto');

// GET /ventas — Consultar todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 }).limit(200);
    res.json(ventas);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// GET /ventas/por-fecha — Ventas en un rango de fechas
router.get('/por-fecha', async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    const ventas = await Venta.find({
      fecha: {
        $gte: new Date(inicio),
        $lte: new Date(fin + 'T23:59:59'),
      }
    }).sort({ fecha: -1 });
    res.json(ventas);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// GET /ventas/altas — Ventas mayores a $10,000
router.get('/altas', async (req, res) => {
  try {
    const ventas = await Venta.find({ total: { $gt: 10000 } }).sort({ total: -1 });
    res.json(ventas);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// GET /ventas/total-vendido — Total vendido acumulado
router.get('/total-vendido', async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    res.json({ total: resultado[0]?.total || 0 });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// GET /ventas/mas-vendidos — Productos más vendidos
router.get('/mas-vendidos', async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $unwind: '$productos' },
      {
        $group: {
          _id: '$productos.productoId',
          nombre:       { $first: '$productos.nombre' },
          totalVendido: { $sum: '$productos.cantidad' },
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          nombre: 1,
          totalVendido: 1,
        }
      }
    ]);
    res.json(resultado);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// POST /ventas — Registrar venta (descuenta stock automáticamente)
router.post('/', async (req, res) => {
  try {
    const { clienteId, clienteNombre, productos, total, fecha } = req.body;
    if (!clienteId || !productos || !productos.length)
      return res.status(400).json({ message: 'Cliente y productos son obligatorios.' });

    // Descontar stock de cada producto
    for (const item of productos) {
      const prod = await Producto.findById(item.productoId);
      if (!prod) return res.status(404).json({ message: `Producto ${item.nombre} no encontrado.` });
      if (prod.stock < item.cantidad)
        return res.status(400).json({ message: `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}` });
      await Producto.findByIdAndUpdate(item.productoId, { $inc: { stock: -item.cantidad } });
    }

    const venta = await Venta.create({ clienteId, clienteNombre, productos, total, fecha: fecha || new Date() });
    res.status(201).json(venta);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
