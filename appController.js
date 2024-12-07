const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.post('/initiate-hiking-clubs', async (req, res) => {
    try {
        const initiateResult = await appService.initiateHikingClubs();
        res.json({ success: initiateResult });
    } catch (error) {
        console.error('Error initializing HikingClubs table:', error);
        res.status(500).json({ success: false });
    }
});

// Insert a new hiking club
router.post('/insert-hiking-club', async (req, res) => {
    const { club_email, club_name, num_of_members } = req.body;
    try {
        const insertResult = await appService.insertHikingClub(club_email, club_name, num_of_members);
        res.json({ success: insertResult });
    } catch (error) {
        console.error('Error inserting into HikingClubs:', error);
        res.status(500).json({ success: false });
    }
});

// Update a hiking club
router.post('/update-hiking-club', async (req, res) => {
    const { club_email, new_name, new_num_of_members } = req.body;
    try {
        const updateResult = await appService.updateHikingClub(club_email, new_name, new_num_of_members);
        res.json({ success: updateResult });
    } catch (error) {
        console.error('Error updating HikingClubs:', error);
        res.status(500).json({ success: false });
    }
});

// Fetch all rows from Join_Hikers1 and Join_Hikers2 table
router.get('/join-hikers', async (req, res) => {
    try {
        const hikers = await appService.fetchJoinHikersFromDb();
        console.log('Fetched hikers:', hikers);
        res.json({ success: true, data: hikers });
    } catch (error) {
        console.error('Error fetching hikers:', error.message);
        res.status(500).json({ success: false, data: [], message: error.message });
    }
});

// Fetch all rows from HikingClubs table
router.get('/hiking-clubs', async (req, res) => {
    try {
        const hikingClubs = await appService.fetchHikingClubsFromDb();
        console.log('Fetched hikers:', hikingClubs);
        res.json({ success: true, data: hikingClubs });
    } catch (error) {
        console.error('Error fetching hiking clubs:', error.message);
        res.status(500).json({ success: false, data: [], message: error.message });
    }
});

// Fetch all rows from Have_Trails1 table
router.get('/have-trails', async (req, res) => {
    try {
        const trails = await appService.fetchHaveTrailsFromDb();
        console.log('Fetched hikers:', trails);
        res.json({ success: true, data: trails });
    } catch (error) {
        console.error('Error fetching trails:', error.message);
        res.status(500).json({ success: false, data: [], message: error.message });
    }
});

router.post('/insert-hiker', async (req, res) => {
    const { hiker_email, name, num_of_trails, club_email } = req.body;

    try {
        // Validate input
        if (!hiker_email || !name || !num_of_trails ||  !club_email) {
            return res.status(400).json({
                success: false,
                message: 'All attributes (hiker_email, name, num_of_trails, club_email) are required.',
            });
        }
        
        const hikerInserted = await appService.insertHiker(hiker_email, name, num_of_trails, club_email);

        if (hikerInserted) {
            res.json({ success: true, message: 'Hiker inserted successfully.' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert hiker.' });
        }
    } catch (error) {
        console.error('Error inserting hiker:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// Update an existing hiker in Join_Hikers1, Join_Hikers2, and HikingClubs
router.post('/update-hiker', async (req, res) => {
    const { hiker_email, new_name, new_num_of_trails, new_club_email } = req.body;
    try {
        const updateResult = await appService.updateHiker(hiker_email, new_name, new_num_of_trails, new_club_email);
        res.json({ success: updateResult });
    } catch (error) {
        console.error('Error updating hiker:', error);
        res.status(500).json({ success: false });
    }
});

// Count rows in the Join_Hikers1 table
router.get('/count-hikers', async (req, res) => {
    try {
        const tableCount = await appService.countJoinHikers();
        res.json({ success: true, count: tableCount });
    } catch (error) {
        console.error('Error counting Join_Hikers1 rows:', error);
        res.status(500).json({ success: false, count: -1 });
    }
});

router.post('/delete-hiking-club', async (req, res) => {
    const { club_email } = req.body;
    console.log('Request to delete hiking club:', club_email);

    try {
        const success = await appService.deleteHikingClub(club_email);
        res.json({ success });
    } catch (error) {
        console.error('Error deleting hiking club:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/delete-hiker', async (req, res) => {
    const { hiker_email } = req.body;
    console.log('Request to delete hiker:', hiker_email);

    try {
        const success = await appService.deleteHiker(hiker_email);
        res.json({ success });
    } catch (error) {
        console.error('Error deleting hiker:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/avg-trails-by-experience', async (req, res) => {
    try {
        const result = await appService.getAvgTrailsByExperienceLevel();

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /avg-trails-by-experience:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/max-trails-by-club', async (req, res) => {
    try {
        const result = await appService.getMaxTrailsByClubWithMembersThreshold();

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /max-trails-by-club:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/hikers-highest-trails', async (req, res) => {
    try {
        const result = await appService.getHikersWithHighestTrailsAndExperience();

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /hikers-highest-trails:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/hikers-all-mountains', async (req, res) => {
    try {
        const result = await appService.getHikersWhoHikedAllMountains();

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /hikers-all-mountains:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/hikers-with-conditions', async (req, res) => {
    const { conditions } = req.body;

    if (!conditions || typeof conditions !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid conditions provided' });
    }

    try {
        const result = await appService.fetchHikersWithConditions(conditions);

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /hikers-with-conditions:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/project-attributes', async (req, res) => {
    const { attributes } = req.body;

    if (!attributes || !Array.isArray(attributes)) {
        return res.status(400).json({ success: false, message: 'Invalid attributes provided' });
    }

    try {
        const result = await appService.fetchProjectedAttributes(attributes);

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /project-attributes:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/hikers-by-trail', async (req, res) => {
    const { trailName } = req.body;

    if (!trailName) {
        return res.status(400).json({ success: false, message: 'Trail name is required' });
    }

    try {
        const result = await appService.fetchHikersByTrailName(trailName);

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in /hikers-by-trail:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router;