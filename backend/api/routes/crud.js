const express = require('express');
const router = express.Router(); // Inicijalizacija rutera
const genericCRUD = require("./genericCRUD");

const { authenticateToken, authRole } = require("../middlewares/authMiddleware");

const tables = ['Person', 'Feedback', 'Branch', 'Teller', 'Dummy']; // Popis tablica

const handleError = (res, error) => {
  res.status(500).json({ error: error.message });
};

// Iteriranje kroz tablice i dodavanje ruta
tables.forEach(tableName => {
  const subRouter = express.Router(); // Inicijalizacija podrutera za svaku tablicu

  subRouter.get('/', async (req, res) => {
    try { res.json(await genericCRUD.getAll(tableName)); }
    catch (error) { handleError(res, error); }
  });

  subRouter.get('/:id', async (req, res) => {
    try { res.json(await genericCRUD.getById(tableName, req.params.id)); }
    catch (error) { handleError(res, error); }
  });

  subRouter.post('/', async (req, res) => {
    try { res.status(201).json(await genericCRUD.add(tableName, req.body)); }
    catch (error) { handleError(res, error); }
  });

  subRouter.put('/:id', async (req, res) => {
    try {
      const entity = await genericCRUD.update(tableName, req.params.id, req.body);
      res.json(entity || { error: 'Entity not found' });
    }
    catch (error) { handleError(res, error); }
  });

  subRouter.delete('/:id', async (req, res) => {
    try { await genericCRUD.deleteById(tableName, req.params.id); res.sendStatus(204); }
    catch (error) { handleError(res, error); }
  });

  subRouter.delete('/', async (req, res) => {
    try { await genericCRUD.deleteAll(tableName); res.sendStatus(204); }
    catch (error) { handleError(res, error); }
  });

  // Dodavanje podrutera za svaku tablicu pod odgovarajuću stazu
  router.use(`/api/${tableName.toLowerCase()}`, subRouter);
});

module.exports = router;
