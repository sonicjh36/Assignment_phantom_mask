const express = require('express');
const router = express.Router();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Configuring
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Phantom Mask API',
        }
    },
    apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);

router.use('/',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

module.exports = router