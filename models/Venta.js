const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombre:     { type: String, required: true },
  precio:     { type: Number, required: true },
  cantidad:   { type: Number, required: true, min: 1 },
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  clienteId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  clienteNombre: { type: String },
  productos:     [itemVentaSchema],
  total:         { type: Number, required: true, min: 0 },
  fecha:         { type: Date, default: Date.now },
  usuarioId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true });

module.exports = mongoose.model('Venta', ventaSchema);
