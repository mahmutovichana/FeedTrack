const roles = {
  superAdmin: "superAdmin",
  tellerAdmin: "tellerAdmin",
  branchAdmin: "branchAdmin",
  user: "user",
};

const swagger = {
  cssUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css",
  customCss:
    ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
};

const deployURLs = {
  backendURL: "http://localhost:5432", // https://feedtrack-backend.vercel.app https://localhost:3000
  frontendURL: "http://localhost:5173" // https://feedtrack.vercel.app https://localhost:5173
}

module.exports = {
  roles,
  swagger,
  deployURLs
};
