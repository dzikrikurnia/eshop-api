
class ProductsHandler {
    #ProductsService;
    #validator;
  
    constructor(service, validator) {
      this.#ProductsService = service;
      this.#validator = validator;
  
      this.postProduct = this.postProduct.bind(this);
      this.getProducts = this.getProducts.bind(this);
      this.getProductById = this.getProductById.bind(this);
      this.putProductById = this.putProductById.bind(this);
      this.deleteProductById = this.deleteProductById.bind(this);
    }
  
    async postProduct(request, h) {
        this.#validator.validateProductsPayload(request.payload);
        const { title, price, description } = request.payload;
    
        const productId = await this.#ProductsService.addProduct(title, price, description);
    
        const response = h.response({
          status: 'success',
          message: 'Produk berhasil ditambahkan',
          data: {
            productId,
          },
        });
        response.code(201);
        return response;
    }
  
    async getProducts(request, h) {
        const products = await this.#ProductsService.getAllProducts();

    return {
      status: 'success',
      message: 'Data produk berhasil diambil',
      data: {
        products,
      }
    };
    }
  
    async getProductById(request, h) {
        const { id } = request.params;

    const product = await this.#ProductsService.getProductById(id);

    return {
      status: 'success',
      message: 'Data produk berhasil diambil',
      data: {
        product,
      },
    };
    }
  
    async putProductById(request, h) {
        this.#validator.validateProductsPayload(request.payload);
    const { id } = request.params;
    const { title, price, description } = request.payload;

    await this.#ProductsService.updateProductById(id, { title, price, description });

    return {
      status: 'success',
      message: 'Produk berhasil diperbarui',
    };
    }
  
    async deleteProductById(request, h) {
        const { id } = request.params;

        await this.#ProductsService.deleteProductById(id);
    
        return {
          status: 'success',
          message: 'Produk berhasil dihapus',
        };
    }
  }
  
  module.exports = ProductsHandler;