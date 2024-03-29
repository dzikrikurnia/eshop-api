const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class ProductsService {
    #database;
  
    constructor(database) {
      this.#database = database;
    }

    async addProduct(userId, title, price, description) {
        const id = `product-${nanoid(16)}`
        const query = `INSERT INTO products (id, title, price, description, image)
          VALUES (
            '${id}',
            '${title}',
            ${price},
            '${description}',
            NULL
          )`;
    
        const result = await this.#database.query(query);
    
        if (!result || result.length < 1 || result.affectedRows  < 1) {
          throw new InvariantError('Gagal menambahkan produk')
        }
    
        return id;
      }

      async getProductById(id) {
        const query = `SELECT * FROM products WHERE id = '${id}'`;
    
        const result = await this.#database.query(query);
    
        if(!result || result.length < 1 || result.affectedRows < 1) {
          throw new NotFoundError('Produk tidak ditemukan');
        }
    
        return result[0];
      }

      async getAllProducts() {
        const query = 'SELECT * FROM products';
    
        const result = await this.#database.query(query);
    
        return result;
      }

      async updateProductById(id, {title, price, description}) {
        const queryProduct = `SELECT id FROM products WHERE id = '${id}'`;
    
        const product = await this.#database.query(queryProduct);
    
        if (!product || product.length < 1 || product.affectedRows < 1) {
          throw new NotFoundError('Produk tidak ditemukan');
        }
    
        const query = `UPDATE products SET 
            title = '${title}',
            price = ${price},
            description = '${description}'
          WHERE id = '${id}'`;
    
        const result = await this.#database.query(query);
    
        if (!result || result.length < 1 || result.affectedRows < 1) {
          throw new InvariantError('Gagal memperbarui produk');
        }
      }

      async deleteProductById(id) {
        const query = `DELETE FROM products WHERE id = '${id}'`;
    
        const result = await this.#database.query(query);
    
        if (!result || result.length < 1 || result.affectedRows < 1) {
          throw new NotFoundError('Gagal menghapus produk, id tidak ditemukan');
        }
      }

      async updateProductImageById(id, filename) {
        const oldFileName = await this.#database.query(
            `SELECT image FROM products WHERE id = '${id}'`,
        );
    
        const queryProduct = `SELECT id FROM products WHERE id = '${id}'`;
    
        const product = await this.#database.query(queryProduct);
    
        if (!product || product.length < 1 || product.affectedRows < 1) {
          throw new NotFoundError('Produk tidak ditemukan');
        }
    
        const query = `UPDATE products SET image = '${filename}' WHERE id = '${id}'`;
    
        const result = await this.#database.query(query);
    
        if (!result || result.length < 1 || result.affectedRows < 1) {
          throw new InvariantError('Gambar produk gagal diperbarui');
        }
    
        // method ini akan mengembalikan nama file yang lama
        return oldFileName[0].image;
      }
    
  }
  
  module.exports = ProductsService;