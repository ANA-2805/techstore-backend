const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// POST /usuarios/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(409).json({ message: 'El email ya está registrado.' });

    const usuario = await Usuario.create({ nombre, email, password });
    res.status(201).json({ message: 'Usuario creado.', usuario: { _id: usuario._id, nombre: usuario.nombre, email: usuario.email } });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /usuarios/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email, activo: true });
    if (!usuario) return res.status(401).json({ message: 'Credenciales incorrectas.' });

    const ok = await usuario.compararPassword(password);
    if (!ok) return res.status(401).json({ message: 'Credenciales incorrectas.' });

    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, usuario: { _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
