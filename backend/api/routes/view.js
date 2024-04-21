const router = require("express").Router();
const db = require("../db");


router.get('/campaign/view/:id', async (req, res) => {
    try { res.json(await getTestById(req.params.id)); }
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


module.exports = router;