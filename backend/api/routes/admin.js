const router = require("express").Router();
const bcrypt = require("bcryptjs");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  authenticateToken, authRole,
} = require("../middlewares/authMiddleware");
const db = require("../db");

router.post(
  "/admin",
  authenticateToken,
  authRole("superAdmin"),
  async (req, res) => {
    const { name, lastName, email, image, password, mobileNumber, role } =
      req.body;

    const adminRoles = ["tellerAdmin", "branchAdmin"];

    const newAdminInfo = [
      name,
      lastName,
      image,
      password,
      email,
      mobileNumber,
      role,
    ];

    if (newAdminInfo.some((info) => !info)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await db.query('SELECT * FROM "Person" WHERE email = $1', [email]);

    if (existingUser.rowCount !== 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!adminRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    newAdminInfo.password = await bcrypt.hash(password, 10);

    try {
      const maxId = await db.query('SELECT MAX(id) AS maxId FROM "Person"');
      const newId = parseInt(maxId.rows[0].maxid) + 1;

      const result = await db.query(
        'INSERT INTO "Person" ("id", "name", "lastName", "image", "password", "email", "mobileNumber", "role") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [newId, ...newAdminInfo]
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    res.status(200).json({ message: "Admin successfully created." });
  }
);

// route for fetching users in users.tsx in case a branchAdmin or tellerAdmin is logged in
// only users with 'user' role are fetched
router.get(
  "/userRoles",
  authenticateToken,
  authRole("branchAdmin", "tellerAdmin"),
  async (req, res) => {
    const query = `SELECT * FROM "Person" WHERE role = 'user'`;
    try { 
      const { rows } = await db.query(query); 
      res.status(200).json(rows); 
    }
    catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching users" });
    }
  }
);


const uploadDir = path.join(__dirname, "../welcome-data");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "welcome-image.png");
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false, req.fileValidationError);
    }
  },
});

router.use("/welcomeData", express.static(uploadDir));

router.post(
  "/welcomeData",
  //authenticateToken,
  //authRole("superAdmin", "tellerAdmin", "branchAdmin"),
  upload.single("file"),
  async (req, res) => {
    if (req.fileValidationError) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    try {
      if (!req.headers["content-type"].includes("multipart/form-data")) {
        return res
          .status(400)
          .json({ message: "Content-Type must be multipart/form-data" });
      }

      if (!req.body.message) {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const data = {
        message: req.body.message,
      };

      fs.writeFileSync(
        `${uploadDir}/welcome-message.json`,
        JSON.stringify(data)
      );

      res
        .status(200)
        .json({ message: "File and message uploaded successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/welcomeData", (req, res) => {
  try {
    const message = JSON.parse(
      fs.readFileSync(`${uploadDir}/welcome-message.json`)
    );
    res.status(200).json(message);
  } catch (err) {
    res.status(200).json({ message: "Default welcome message" });
  }
});

module.exports = router;