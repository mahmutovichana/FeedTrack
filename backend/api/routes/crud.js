const express = require('express');
const router = express.Router(); // Router initialization

const { authenticateToken, authRole } = require("../middlewares/authMiddleware");
const genericCRUD = require("./genericCRUD");

function setupRoutes(genericModel, tableName) {
  const subRouter = express.Router(); 

  const handleError = (res, error) => {
    res.status(500).json({ error: error.message });
  };

  // subRouter.use(authenticateToken, authRole("superAdmin", "branchAdmin", "tellerAdmin"));
  
  subRouter.get('/', async (req, res) => {
    try { res.json(await genericModel.getAll(tableName)); }
    catch (error) { handleError(res, error); }
  });

  subRouter.post('/name', async (req, res) => {
    try {
      const { name } = req.body;
      const result = await genericModel.getByName(tableName, name);
      res.json({ result });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  subRouter.post('/id', async (req, res) => {
    try {
      const { id } = req.body;
      const result = await genericModel.getById(tableName, id);
      res.json({ result });
    } catch (error) {
      handleError(res, error);
    }
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

  /* subRouter.use((req, res, next) => {
    const { user } = req.authUser;
    // if the current user wanting to use any of these routes is a superAdmin, then everything is allowed
    if (user.role === 'superAdmin') {
      next();
    } else {
      // if the user is not a superAdmin, check if it is a POST /users route with body role: someAdmin
      // we must not allow this, only if its a body role: user (only superAdmins can create other admins) 
      if (req.method === 'POST' && req.path === '/') {
        const { role: newRole } = req.body;
        // check for the submitted role of the new user
        if (newRole === 'user') next();
        else {
            res.status(403).json({ error: 'Unauthorized' });
        }
      } else next();
    }
  }); */

  return subRouter; // Returning the subrouter filled with routes for one "generic" table
}

// Setup routes for each table
const userRouter = setupRoutes(genericCRUD, "Person");
const feedbackRouter = setupRoutes(genericCRUD, "Feedback");
const branchRouter = setupRoutes(genericCRUD, "Branch");
const tellerRouter = setupRoutes(genericCRUD, "Teller");
const dummyRouter = setupRoutes(genericCRUD, "Dummy"); // only for testing
const questionRouter = setupRoutes(genericCRUD, "Question");
const campaignRouter = setupRoutes(genericCRUD, "Campaign");
const campaignQuestionRouter = setupRoutes(genericCRUD, "CampaignQuestion");
const branchCampaignRouter = setupRoutes(genericCRUD, "BranchCampaign");
const teaserDataRouter = setupRoutes(genericCRUD, "TeaserData");

// Adding the routes to the app
router.use("/users", userRouter);
router.use("/feedbacks", feedbackRouter);
router.use("/branches", branchRouter);
router.use("/tellers", tellerRouter);
router.use("/dummy", dummyRouter); // only for testing
router.use("/questions", questionRouter);
router.use("/campaigns", campaignRouter);
router.use("/campaignQuestions", campaignQuestionRouter);
router.use("/branchCampaigns", branchCampaignRouter);
router.use("/teaserData", teaserDataRouter);

module.exports = router;