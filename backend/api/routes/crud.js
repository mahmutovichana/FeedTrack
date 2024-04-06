const router = require("express").Router();
const express = require('express');
const { authenticateToken, authRole } = require("../middlewares/authMiddleware");
const genericCRUD = require("./genericCRUD");

function setupRoutes(genericModel, tableName) {
  const handleError = (res, error) => {
    res.status(500).json({ error: error.message });
  };

  // Middleware for checking auth and roles before all routes
  // router.use(authenticateToken, authRole("superAdmin", "tellerAdmin", "branchAdmin"));
/*
  router.get('/', async (req, res) => {
      try { res.json(await genericModel.getAll(tableName)); }
      catch (error) { handleError(res, error); }
    });*/

    router.get('/users', async (req, res) => {
        try { res.json(await genericModel.getAll(Person)); }
        catch (error) { handleError(res, error); }
    });

  router.get('/:id', async (req, res) => {
      try { res.json(await genericModel.getById(tableName, req.params.id)); }
      catch (error) { handleError(res, error); }
    });

  router.post('/', async (req, res) => {
      try { res.status(201).json(await genericModel.add(tableName, req.body)); }
      catch (error) { handleError(res, error); }
    });

  router.put('/:id', async (req, res) => {
      try {
        const entity = await genericModel.update(tableName, req.params.id, req.body);
        res.json(entity || { error: 'Entity not found' });
      }
      catch (error) { handleError(res, error); }
    });

  router.delete('/:id', async (req, res) => {
      try { await genericModel.deleteById(tableName, req.params.id); res.sendStatus(204); }
      catch (error) { handleError(res, error); }
    });

  router.delete('/', async (req, res) => {
      try { await genericModel.deleteAll(tableName); res.sendStatus(204); }
      catch (error) { handleError(res, error); }
    });

  return router;
}

const userRouter = setupRoutes(genericCRUD, "Person");
const feedbackRouter = setupRoutes(genericCRUD, "Feedback");
const branchRouter = setupRoutes(genericCRUD, "Branch");
const tellerRouter = setupRoutes(genericCRUD, "Teller");
const dummyRouter = setupRoutes(genericCRUD, "Dummy"); // only for testing

router.use("/users", userRouter);
router.use("/feedbacks", feedbackRouter);
router.use("/branches", branchRouter);
router.use("/teller", tellerRouter);
router.use("/dummy", dummyRouter); // only for testing

module.exports = router;