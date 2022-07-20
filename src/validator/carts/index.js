const InvariantError = require('../../exceptions/InvariantError');
const { CartsPayloadSchema, CartsQuerySchema } = require('./schema');

const CartsValidator = {
  // untuk memvalidasoi inputan user saat menambahkan item ke keranjang
  validateCartsPayload: (payload) => {
    const validationResult = CartsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  // untuk memvalidasoi inputan user saat mengubah jumlah quantity item di keranjang
  validateCartsQuery: (query) => {
    const validationResult = CartsQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CartsValidator;