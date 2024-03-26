const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "FeedTrack API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "http://feedtrack-backend.vercel.app",
        description: "Production server",
      },
    ],
  },
  apis: ["api/routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
