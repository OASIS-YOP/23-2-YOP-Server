import swaggerUi from 'swagger-ui-express'
import swaggereJsdoc from 'swagger-jsdoc'

const options = {
  swaggerDefinition: {
      info: {
          title: 'Ohnpol',
          version: '1.0.0',
          description: 'API with express',
      },
      host: 'localhost:3000',
      basePath: '/'
  },
  apis: ['./routes/*.js', './swagger/*']
};

const specs = swaggereJsdoc(options);

export {
  swaggerUi,
  specs
};
