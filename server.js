// ============================================================
//  server.js — Servidor principal TechStore
// ============================================================
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

const usuariosRouter  = require('./routes/usuarios');
const productosRouter = require('./routes/productos');
const clientesRouter  = require('./routes/clientes');
const ventasRouter    = require('./routes/ventas');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ---- Conexión a MongoDB Atlas ----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

// ---- Rutas ----
app.use('/usuarios',  usuariosRouter);
app.use('/productos', productosRouter);
app.use('/clientes',  clientesRouter);
app.use('/ventas',    ventasRouter);

// ---- Ruta raíz ----
app.get('/', (req, res) => {
  res.json({ mensaje: 'TechStore API funcionando 🚀', version: '1.0.0' });
});

// ---- Manejo de errores globales ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
