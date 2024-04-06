// routes/crud.js
const express = require('express');
const router = express.Router();
const genericCRUD = require("./genericCRUD");

const tables = ['Person', 'Feedback', 'Branch', 'Teller', 'Dummy'];

const handleError = (res, error) => {
  res.status(500).json({ error: error.message });
};

console.log("bar sam u crud.js..");

tables.forEach(tableName => {
  const subRouter = express.Router();

  subRouter.get('/', async (req, res) => {
    try { 
      console.log(`Fetching all records for table: ${tableName}`);
      res.json(await genericCRUD.getAll(tableName)); 
    }
    catch (error) { 
      console.error(`Error fetching all records for table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  subRouter.get('/:id', async (req, res) => {
    try { 
      console.log(`Fetching record with ID ${req.params.id} from table: ${tableName}`);
      res.json(await genericCRUD.getById(tableName, req.params.id)); 
    }
    catch (error) { 
      console.error(`Error fetching record with ID ${req.params.id} from table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  subRouter.post('/', async (req, res) => {
    try { 
      console.log(`Adding a new record to table: ${tableName}`);
      res.status(201).json(await genericCRUD.add(tableName, req.body)); 
    }
    catch (error) { 
      console.error(`Error adding a new record to table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  subRouter.put('/:id', async (req, res) => {
    try {
      console.log(`Updating record with ID ${req.params.id} in table: ${tableName}`);
      const entity = await genericCRUD.update(tableName, req.params.id, req.body);
      res.json(entity || { error: 'Entity not found' });
    }
    catch (error) { 
      console.error(`Error updating record with ID ${req.params.id} in table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  subRouter.delete('/:id', async (req, res) => {
    try { 
      console.log(`Deleting record with ID ${req.params.id} from table: ${tableName}`);
      await genericCRUD.deleteById(tableName, req.params.id); 
      res.sendStatus(204); 
    }
    catch (error) { 
      console.error(`Error deleting record with ID ${req.params.id} from table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  subRouter.delete('/', async (req, res) => {
    try { 
      console.log(`Deleting all records from table: ${tableName}`);
      await genericCRUD.deleteAll(tableName); 
      res.sendStatus(204); 
    }
    catch (error) { 
      console.error(`Error deleting all records from table ${tableName}:`, error);
      handleError(res, error); 
    }
  });

  router.use(`/${tableName.toLowerCase()}`, subRouter);
});

module.exports = router;
