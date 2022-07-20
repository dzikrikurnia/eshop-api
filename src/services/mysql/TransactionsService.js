const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class TransactionsService {
    #database;
  
    constructor(database) {
      this.#database = database;
    }

    async addCheckout(userId) {
        // mengambil data user, apakah terdapat di database
        const queryUser = `SELECT id FROM users WHERE id = '${userId}'`;
        const user = await this.#database.query(queryUser);
    
        // jika tidak ada user dengan id tersebut, maka tidak bisa melakukan checkout
        if (!user || user.length < 1 || user.affectedRows < 1) {
          throw new NotFoundError('Gagal checkout, user tidak ditemukan');
        }
    
        // mengambil data cart dari user tersebut, apakah terdapat di database
        const queryCarts = `SELECT productId, quantity FROM carts WHERE userId = '${userId}'`;
        const carts = await this.#database.query(queryCarts);
    
        // jika tidak ada cart dari user tersebut, maka tidak bisa melakukan checkout
        if (!carts || carts.length < 1 || carts.affectedRows < 1) {
          throw new NotFoundError('Gagal checkout, tidak terdapat item apapun di keranjang');
        }
    
        // membuat transaksi dengan memasukan data id user dan waktu checkout
        const transactionId = `transaction-${nanoid(16)}`;
        const queryTransaction = `INSERT INTO transactions (id, userId, dateCreated) VALUES (
          '${transactionId}',
          '${userId}',
          '${new Date().toLocaleString()}'
        )`;
        const transaction = await this.#database.query(queryTransaction);
    
        // jika gagal kembalikan error
        if (!transaction || transaction.length < 1 || transaction.affectedRows < 1) {
          throw new InvariantError('Gagal membuat transaksi');
        }
    
        /**
         * Perhatikan kode di bawah
         * Kita akan me looping setiap item yang ada di cart dan memasukan data tersebut ke dalam table orders
         * Jadi sebetulnya table orders itu seperti table carts, namun untuk item yang sudah di checkout.
         * Jangan lupa untuk menambahkan id transaksi sebagai relasinya dengan table transactions
         **/
        carts.forEach(async (product) => {
          const id = `orderItem-${nanoid(16)}`;
          const query = `INSERT INTO orders (id, productId, userId, transactionId, quantity) VALUES (
            '${id}',
            '${product.productId}',
            '${userId}',
            '${transactionId}',
            '${product.quantity}'
          )`;
    
          const result = await this.#database.query(query);
    
          if (!result || result.length < 1 || result.affectedRows < 1) {
            throw new InvariantError('Transaksi gagal');
          }
        });
    
        // jika berhasil, hapus semua item yang ada di carts
        await this.#database.query(`DELETE FROM carts WHERE userId = '${userId}'`);
    
        return transactionId;
      }

      async getTransactionsByUserId(userId) {
        const query = `SELECT id, dateCreated FROM transactions WHERE userId = '${userId}'`;
    
        const result = await this.#database.query(query);
    
        return result;
      }

      async #verifyTransactionOwner(userId, transactionId) {
        const queryItem = `SELECT id FROM transactions WHERE id = '${transactionId}'`;
    
        const transaction = await this.#database.query(queryItem);
    
        if (!transaction || transaction.length < 1 || transaction.affectedRows < 1) {
          throw new NotFoundError('Transaksi tidak ditemukan');
        }
    
        const query = `SELECT id, dateCreated FROM transactions WHERE id = '${transactionId}' AND userId = '${userId}'`;
    
        const result = await this.#database.query(query);
    
        if (!result || result.length < 1 || result.affectedRows < 1) {
          throw new AuthorizationError('Transaksi tidak ditemukan, anda tidak mempunyai hak untuk mengakses ini');
        }
    
        return result[0];
      }

      async getTransactionById(userId, transactionId) {
        const transaction = await this.#verifyTransactionOwner(userId, transactionId);
    
        // untuk mengambil detail item yang ada di transaksi ini
        // kita akan menggunakan query JOIN table orders dengan table products
        // sesuai dengan id product yang ada di table orders
        const query = `
          SELECT products.title, products.price, products.image,
            orders.quantity
          FROM orders JOIN products
          ON orders.productId = products.id
          WHERE orders.transactionId = '${transaction.id}'
          AND orders.userId = '${userId}'
        `;
    
        const orders = await this.#database.query(query);
    
        if (!orders || orders.length < 1 || orders.affectedRows < 1) {
          throw new InvariantError('Transaksi gagal dimuat');
        }
    
        return {
          transaction,
          orders,
        };
      }


  }
  
  module.exports = TransactionsService;