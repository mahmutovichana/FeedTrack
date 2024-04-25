const db = require("../db");
const bcrypt = require("bcryptjs");

module.exports = {
  getAll: async (tableName) => {
    const query = `SELECT * FROM "${tableName}"`;
    console.log("getAll query:", query);
    const { rows } = await db.query(query);
    return rows;
  },

  getById: async (tableName, id) => {
    const query = `SELECT * FROM "${tableName}" WHERE id = $1`;
    console.log("getById query:", query, "id:", id);
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  getByName: async (tableName, name) => {
    const query = `SELECT * FROM "${tableName}" WHERE name = $1`;
    console.log("getByName query:", query, "name:", name);
    const { rows } = await db.query(query, [name]);
    return rows[0];
  },

  add: async (tableName, data) => {
    // Getting the columns and values
    var columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    columns = columns + ",\"id\"";

    // Fetching the count of rows in the table
    const countQuery = `SELECT MAX(id) FROM "${tableName}"`;
    const { rows: countRows } = await db.query(countQuery);
    console.log(countRows[0]);
    const id = isNaN(parseInt(countRows[0].max)) ? 1 : parseInt(countRows[0].max) + 1;
    console.log(id);

    // Adding the ID to the inserted row
    var values = Object.values(data);
    values.push(id);

    // If adding a new user, encrypt the password
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      values[values.indexOf(data.password)] = hashedPassword;
    }
    // Generating placeholders for prepared statement
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    // Creating query to insert data into table and get back inserted row
    const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`;
    console.log("add query:", query, "id:", id);
    const { rows } = await db.query(query, values);

    return rows[0];
  }
  ,

  update: async (tableName, id, data) => {
    const updates = Object.entries(data).map(([key, value], index) => {
      if (key === 'password') {
        bcrypt.hashSync(value, 10); 
        return `"${key}" = $${index + 1}`;
      } else {
        return `"${key}" = $${index + 1}`;
      }
    });
    const values = Object.values(data);
    const passwordIndex = Object.keys(data).indexOf('password');
    if (passwordIndex !== -1) {
      const hashedPassword = bcrypt.hashSync(data.password, 10); 
      values[passwordIndex] = hashedPassword;
    }
    const query = `UPDATE "${tableName}" SET ${updates.join(', ')} WHERE id = $${values.length + 1} RETURNING *`;
    console.log("update query:", query, "values:", [...values, id]);
    const { rows } = await db.query(query, [...values, id]);
    return rows[0];
  },

  deleteById: async (tableName, id) => {
    const query = `DELETE FROM "${tableName}" WHERE id = $1`;
    console.log("deleteById query:", query, "id:", id);
    await db.query(query, [id]);
  },

  deleteAll: async (tableName) => {
    const query = `DELETE FROM "${tableName}"`;
    console.log("deleteAll query:", query);
    await db.query(query);
  }
};