const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true, trim: true },
  categoria:   { type: String, trim: true, default: 'General' },
  precio:      { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0, default: 0 },
  descripcion: { type: String, trim: true },
  activo:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
