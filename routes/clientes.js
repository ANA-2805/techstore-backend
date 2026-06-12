const router  = require('express').Router();
const Cliente = require('../models/Cliente');

// GET /clientes — Consultar clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find({ activo: true }).sort({ nombre: 1 });
    res.json(clientes);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// POST /clientes — Registrar cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    if (!nombre || !email)
      return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
    const existe = await Cliente.findOne({ email });
    if (existe) return res.status(409).json({ message: 'El email ya está registrado.' });
    const cliente = await Cliente.create({ nombre, email, telefono, direccion });
    res.status(201).json(cliente);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// PUT /clientes/:id — Editar cliente
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
