const express = require('express');
const router = express.Router(); // Inicijalizacija rutera

const { authenticateToken, authRole } = require("../middlewares/authMiddleware");
const genericCRUD = require("./genericCRUD");

// Definiranje funkcije za rute
function setupRoutes(genericModel, tableName) {
  const subRouter = express.Router(); // Inicijalizacija podrutera

  const handleError = (res, error) => {
    res.status(500).json({ error: error.message });
  };
  
  subRouter.get('/', async (req, res) => {
      try { res.json(await genericModel.getAll(tableName)); }
      catch (error) { handleError(res, error); }
    });
    
  subRouter.get('/:id', async (req, res) => {
      try { res.json(await genericModel.getById(tableName, req.params.id)); }
      catch (error) { handleError(res, error); }
    });

  subRouter.post('/', async (req, res) => {
      try { res.status(201).json(await genericModel.add(tableName, req.body)); }
      catch (error) { handleError(res, error); }
    });

  subRouter.put('/:id', async (req, res) => {
      try {
        const entity = await genericModel.update(tableName, req.params.id, req.body);
        res.json(entity || { error: 'Entity not found' });
      }
      catch (error) { handleError(res, error); }
    });

  subRouter.delete('/:id', async (req, res) => {
      try { await genericModel.deleteById(tableName, req.params.id); res.sendStatus(204); }
      catch (error) { handleError(res, error); }
    });

  subRouter.delete('/', async (req, res) => {
      try { await genericModel.deleteAll(tableName); res.sendStatus(204); }
      catch (error) { handleError(res, error); }
    });

  return subRouter; // Vraćanje podrutera
}

// Setup rute za različite tabele
const userRouter = setupRoutes(genericCRUD, "Person");
const feedbackRouter = setupRoutes(genericCRUD, "Feedback");
const branchRouter = setupRoutes(genericCRUD, "Branch");
const tellerRouter = setupRoutes(genericCRUD, "Teller");
const dummyRouter = setupRoutes(genericCRUD, "Dummy"); // only for testing

// Dodavanje ruta u aplikaciju
router.use("/users", userRouter);
router.use("/feedbacks", feedbackRouter);
router.use("/branches", branchRouter);
router.use("/tellers", tellerRouter);
router.use("/dummy", dummyRouter); // only for testing

module.exports = router;
