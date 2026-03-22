const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  barcode: { type: String, required: true, unique: true },
  weightValue: { type: Number, default: 0 },
  weightUnit: { type: String, enum: ['kg', 'g'], default: 'kg' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
