const router = require("express").Router();
const db = require("../db");


router.get('/campaign/view/:id', async (req, res) => {
    try { res.json(await getTestById(req.params.id)); }
    catch (error) { handleError(res, error); }
});

router.get('/branchCampaigns/view/:id', async (req, res) => {
    try { res.json(await getBranchCampaignsById(req.params.id)); }
    catch (error) { handleError(res, error); }
});

router.get('/branch/view', async (req, res) => {
    try { res.json(await getView("branch_view")); }
    catch (error) { handleError(res, error); }
});

router.get('/teller/view', async (req, res) => {
    try { res.json(await getView("teller_view")); }
    catch (error) { handleError(res, error); }
});

router.get('/feedback/view', async (req, res) => {
    try { res.json(await getView("feedback_view")); }
    catch (error) { handleError(res, error); }
});

const getView = async (tableName) => {
    try{
        const query = `SELECT * FROM "${tableName}"`;
        console.log("getAll query:", query);
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error("Error in getView: ",error);
        throw error;
    }
}

const handleError = (res, error) => {
    res.status(500).json({ error: error.message });
};

const getTestById = async (id) => {
    try {
        const query = `SELECT * FROM "test" WHERE "campaignID" = $1`;
        console.log("getById query:", query, "id:", id);
        const { rows } = await db.query(query, [id]);
        return rows;
    } catch (error) {
        // Handle any errors that might occur during the database query
        console.error("Error in getTestById:", error);
        throw error; // Rethrow the error to be handled by the calling code
    }
};

const getBranchCampaignsById = async (id) => {
    try {
        const query = `SELECT * FROM "branchcampaigns_view" WHERE "branchID" = $1`;
        console.log("getById query:", query, "id:", id);
        const { rows } = await db.query(query, [id]);
        return rows;
    } catch (error) {
        // Handle any errors that might occur during the database query
        console.error("Error in getBranchCampaignsById:", error);
        throw error; // Rethrow the error to be handled by the calling code
    }
};

const getCampaignByLocation = async (location) => {
    try {
        const query = `SELECT "campaignID" FROM "Branch" WHERE location = $1`;
        console.log("getByLocation query:", query, "location:", location);
        const { rows } = await db.query(query, [location]);
        return rows[0];
    } catch (error) {
        // Handle any errors that might occur during the database query
        console.error("Error in getCampaignByLocation:", error);
        throw error; // Rethrow the error to be handled by the calling code
    }
};


router.get('/campaign/byName/:location', async (req, res) => {
    try { res.json(await getCampaignByLocation(req.params.location)); }
    catch (error) { handleError(res, error); }
});


// Fetch all campaigns from CampaignBranch table via their common branchID foreign key
const getCampaignsByBranchId = async (branchID) => {
    try {
        const query = `SELECT bc."branchID", bc."campaignID", c.*
                       FROM "BranchCampaign" bc
                       JOIN "Campaign" c ON bc."campaignID" = c.id
                       WHERE bc."branchID" = $1`;
        const { rows } = await db.query(query, [branchID]);
        return rows;
    } catch (error) {
        throw error;
    }
};

router.get('/branchCampaign/byBranchID/:branchID', async (req, res) => {
    try { res.json(await getCampaignsByBranchId(req.params.branchID)); }
    catch (error) { handleError(res, error); }
});

// Fetch all questions from CampaignQuestion table via their common campaignID foreign key
const getQuestionsByCampaignId = async (campaignID) => {
    try {
        const query = `SELECT Q.*
                       FROM "CampaignQuestion" AS CQ
                       JOIN "Question" AS Q ON CQ."questionID" = Q.id
                       WHERE CQ."campaignID" = $1`;
        const { rows } = await db.query(query, [campaignID]);
        return rows;
    } catch (error) {
        throw error;
    }
};

router.get('/campaignQuestion/byCampaignID/:campaignID', async (req, res) => {
    try { res.json(await getQuestionsByCampaignId(req.params.campaignID)); }
    catch (error) { handleError(res, error); }
});

// Retrieve a campaign by its name
const getCampaignByName = async (name) => {
    try {
        const query = `SELECT * FROM "Campaign" WHERE name = $1`;
        const { rows } = await db.query(query, [name]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

router.get('/campaign/view/name/:name', async (req, res) => {
    try { res.json(await getCampaignByName(req.params.name)); }
    catch (error) { handleError(res, error); }
});

// Fetch all campaign ids from CampaignQuestion table via their common questionID foreign key
const getCampaignIdsByQuestionId = async (campaignID) => {
    try {
        const query = `SELECT CQ."campaignID"
                       FROM "CampaignQuestion" AS CQ
                       WHERE CQ."questionID" = $1`;
        const { rows } = await db.query(query, [campaignID]);
        return rows;
    } catch (error) {
        throw error;
    }
};

router.get('/campaignQuestion/byQuestionID/:questionID', async (req, res) => {
    try { res.json(await getCampaignIdsByQuestionId(req.params.questionID)); }
    catch (error) { handleError(res, error); }
});

module.exports = router;