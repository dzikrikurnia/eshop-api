const Joi = require('joi');

// method ini digunakan untuk memvalidasi inputan user
// saat menambahkan item ke keranjang
const CartsPayloadSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

// method ini digunakan untuk memvalidasi inputan user
// saat mengubah jumlah quantity item di keranjang
const CartsQuerySchema = Joi.object({
  qty: Joi.number().min(1).required(),
});

module.exports = { CartsPayloadSchema, CartsQuerySchema };