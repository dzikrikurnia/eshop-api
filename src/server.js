require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

//
const authentication = require('./api/authentication');
const Database = require('./conf/Database');
const AuthenticationService = require('./services/mysql/AuthenticationService');
const AuthenticationValidator = require('./validator/authentication');

//products
const products = require('./api/products');
const ProductsService = require('./services/mysql/ProductService');
const ProductsValidator = require('./validator/products');
const ClientError = require('./exceptions/ClientError');

// carts
const carts = require('./api/carts');
const CartsService = require('./services/mysql/CartsService');
const CartsValidator = require('./validator/carts');

const init = async () => {
  const database = new Database();
  const authenticationService = new AuthenticationService(database);
  const productsService = new ProductsService(database);
  const cartsService = new CartsService(database);

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      name: 'DEKA',
    }),
  });

  // extension
  server.ext('onPreResponse', (request, h) => {
    const {response} = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    console.log(response);

    return h.continue;
  });

  // register external plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);


  // defines authentication strategy
  server.auth.strategy('eshop_jwt', 'jwt',{
      keys: process.env.TOKEN_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
  });


  //defines internal plugin
  await server.register([
    {
      plugin: authentication,
      options: {
        service: authenticationService,
        validator: AuthenticationValidator,
        
      },
    },
    {
      plugin: products,
      options: {
        service: productsService,
        validator: ProductsValidator,
      }
    },
    {
      plugin: carts,
      options: {
        service: cartsService,
        validator: CartsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

init();