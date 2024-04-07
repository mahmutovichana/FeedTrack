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
<<<<<<< HEAD
  backendURL: "https://feed-track-backend.vercel.app", // localhost:3000
  frontendURL: "https://feed-track-backup.vercel.app" // localhost:5173
=======
  backendURL: "https://feedtrack-backend.vercel.app",
  frontendURL: "https://feedtrack.vercel.app"
>>>>>>> main
}

module.exports = {
  roles,
  swagger,
  deployURLs
};
