const ProductsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'products',
  version: '1.0.0',
  // menambahkan opsi untuk mengubah `service` menjadi `productsService`
  // dan menambahkan `storageService`
  register: async (server, { productsService, storageService, validator }) => {
    const handler = new ProductsHandler(productsService, storageService, validator);
    server.route(routes(handler));
  },
};