const express = require('express');
const router = express.Router();
const genericCRUD = require("../genericCRUD");

const tables = ['Person', 'Feedback', 'Branch', 'Teller', 'Dummy'];

const handleError = (res, error) => {
  res.status(500).json({ error: error.message });
};

tables.forEach(tableName => {
  const subRouter = express.Router();

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

  router.use(`/${tableName.toLowerCase()}`, subRouter);
});

module.exports = router;
