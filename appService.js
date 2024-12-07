const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

const fs = require('fs'); // Import the 'fs' module for file system operations
const path = require('path');

async function initiateHikingClubs() {
    return await withOracleDB(async (connection) => {
        const dropQueries = [
                `DROP TABLE Provide CASCADE CONSTRAINTS`,
                `DROP TABLE Provide_TrekkingPoles1 CASCADE CONSTRAINTS`,
                `DROP TABLE Provide_TrekkingPoles2 CASCADE CONSTRAINTS`,
                `DROP TABLE EmergencyServices CASCADE CONSTRAINTS`,
                `DROP TABLE Join_Hikers1 CASCADE CONSTRAINTS`,
                `DROP TABLE Join_Hikers2 CASCADE CONSTRAINTS`,
                `DROP TABLE HikingClubs CASCADE CONSTRAINTS`,
                `DROP TABLE Schedule_ClubHikingEvents CASCADE CONSTRAINTS`,
                `DROP TABLE Have_Organizers1 CASCADE CONSTRAINTS`,
                `DROP TABLE Have_Organizers2 CASCADE CONSTRAINTS`,
                `DROP TABLE Participate CASCADE CONSTRAINTS`,
                `DROP TABLE Mountains CASCADE CONSTRAINTS`,
                `DROP TABLE Have_Trails1 CASCADE CONSTRAINTS`,
                `DROP TABLE Have_Trails2 CASCADE CONSTRAINTS`,
                `DROP TABLE Hike CASCADE CONSTRAINTS`,
                `DROP TABLE HikersWithCars CASCADE CONSTRAINTS`,
                `DROP TABLE Carpool_HikersWithoutCars CASCADE CONSTRAINTS`
            ];

            for (const query of dropQueries) {
                try {
                    // console.log(`Executing: ${query}`);
                    await connection.execute(query);
                } catch (err) {
                    if (err.errorNum === 942) {
                        console.log(`Table does not exist, skipping drop: ${query}`);
                    } else {
                        throw err;
                    }
                }
            }

            // console.log('All tables dropped successfully. Proceeding to create new tables...');


        const filePath = path.resolve(__dirname, 'sql_script.sql');

        // Read the SQL file with the correct encoding
        const sql = fs.readFileSync(filePath, 'utf8');

        // Debug: Log the file contents (optional, for debugging purposes)
        // console.log('SQL file contents:', sql);

        // Split the SQL script into individual statements
        const sqlStatements = sql.split(';').map(statement => statement.trim()).filter(statement => statement.length > 0);

        // Execute each SQL statement
        for (const statement of sqlStatements) {
            console.log(`Executing: ${statement}`);
            await connection.execute(statement, [], { autoCommit: true });
        }

        const JoinHikers1And2Query = `
                SELECT j1.HikerEmail, j1.Name, j1.NumofTrailsCompleted, j2.ExperienceLevel, j1.ClubEmail
                FROM Join_Hikers1 j1, Join_Hikers2 j2
                WHERE j1.NumofTrailsCompleted = j2.NumofTrailsCompleted
            `;
        const result = await connection.execute(JoinHikers1And2Query);
        console.log("JoinHikers1And2Query result:", result);

        const HikingClubsQuery = `
                SELECT *
                FROM HikingClubs
            `;
        const result2 = await connection.execute(HikingClubsQuery);
        console.log("HikingClubsQuery result:", result2);

        const HaveTrailsQuery = `
                SELECT Latitude, Longitude, Name, ElevationGain, Distance
                FROM Have_Trails1
            `;
        const result3 = await connection.execute(HaveTrailsQuery);
        console.log("HaveTrailsQuery result:", result3);

        console.log('Tables initialized successfully.');
        return true;
    }).catch((err) => {
        console.error('Error initializing tables:', err.message);
        return false;
    });
}



async function fetchJoinHikersFromDb() {
    console.log("Fetching data from Join_Hikers1...");
    return await withOracleDB(async (connection) => {
        const JoinHikers1And2Query = `
                SELECT j1.HikerEmail, j1.Name, j1.NumofTrailsCompleted, j2.ExperienceLevel, j1.ClubEmail
                FROM Join_Hikers1 j1, Join_Hikers2 j2
                WHERE j1.NumofTrailsCompleted = j2.NumofTrailsCompleted
            `;
        const result = await connection.execute(JoinHikers1And2Query);
        console.log("Query result:", result.rows);
        return result.rows;
    }).catch((err) => {
        console.log("Error fetching Join_Hikers1 data:", err.message);
        return [];
    });
}

async function fetchHikingClubsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM HikingClubs');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchHaveTrailsFromDb() {
    console.log("Fetching data from Have_Trails1...");
    return await withOracleDB(async (connection) => {
        const HaveTrailsQuery = `
                SELECT Latitude, Longitude, Name, ElevationGain, Distance
                FROM Have_Trails1
            `;
        const result = await connection.execute(HaveTrailsQuery);
        console.log("Query result:", result.rows);
        return result.rows;
    }).catch((err) => {
        console.log("Error fetching Have_Trails1 data:", err.message);
        return [];
    });
}


// 2.1.1-1 INSERT hiker
async function insertHiker(hikerEmail, name, numOfTrailsCompleted, clubEmail) {
    if (!hikerEmail || !name || numOfTrailsCompleted == null || !clubEmail) {
        throw new Error('Missing required attributes');
    }

    return await withOracleDB(async (connection) => {

        try {
            // check if HikerEmail already exists in Join_Hikers1
            const checkHikerQuery = `
                SELECT COUNT(*)
                FROM Join_Hikers1 
                WHERE HikerEmail = :hikerEmail
            `;
            const checkHikerResult = await connection.execute(checkHikerQuery, { hikerEmail });
            const hikerExists = checkHikerResult.rows[0][0] > 0;
            if (hikerExists) {
                throw new Error('Hiker already exists');
            }

            // check if ClubEmail exists in HikingClubs
            const checkClubQuery = `
                SELECT COUNT(*)
                FROM HikingClubs 
                WHERE ClubEmail = :clubEmail
            `;
            const checkClubResult = await connection.execute(checkClubQuery, { clubEmail });
            const clubExists = checkClubResult.rows[0][0] > 0;
            if (!clubExists) {
                throw new Error('Club does not exist');
            }

            // check/insert NumofTrailsCompleted into Join_Hikers2 if it does not exist
            const numTrailsInsert = await insertHiker2(numOfTrailsCompleted);
            if (!numTrailsInsert) {
                throw new Error('Failed to insert numOfTrailsCompleted into Join_Hikers2');
            }

            // hiker doesn't exist -> insert into Join_Hikers1
            const insertHikers1Query = `
                INSERT INTO Join_Hikers1 (HikerEmail, Name, NumofTrailsCompleted, ClubEmail)
                VALUES (:hikerEmail, :name, :numOfTrailsCompleted, :clubEmail)
            `;
            await connection.execute(insertHikers1Query, { hikerEmail, name, numOfTrailsCompleted, clubEmail }, { autoCommit: true });

            // update HikingClubs's attribute: NumofMembers
            const updateHikeringClub1Query = `
                UPDATE HikingClubs 
                SET NumofMembers = NumofMembers + 1 
                WHERE ClubEmail = :clubEmail
            `;
            await connection.execute(updateHikeringClub1Query, { clubEmail }, { autoCommit: true });

            return true;
        } catch (err) {
            console.error('Error inserting hiker:', err.message);
            return false;
        }
    });
}

// helper function: determine experienceLevel based on numOfTrailsCompleted
function getExperienceLevel(numOfTrailsCompleted) {
    if (numOfTrailsCompleted >= 0 && numOfTrailsCompleted < 15) {
      return 'junior';
    } else if (numOfTrailsCompleted >= 15 && numOfTrailsCompleted < 30) {
      return 'intermediate';
    } else { // numOfTrailsCompleted >= 30
      return 'senior';
    }
}
  
// helper function: insert a new numOfTrailsCompleted into Join_Hikers2
async function insertHiker2(numOfTrailsCompleted) {
    const experienceLevel = getExperienceLevel(numOfTrailsCompleted);
    
    return await withOracleDB(async (connection) => {
        try {
            // check if NumofTrailsCompleted already exists in Join_Hikers2
            const checkHiker2Query = `
                SELECT COUNT(*)
                FROM Join_Hikers2 
                WHERE NumofTrailsCompleted = :numOfTrailsCompleted
            `;
            const checkHiker2Result = await connection.execute(checkHiker2Query, { numOfTrailsCompleted });
            // const trailsExists = checkHiker2Result.rows[0].COUNT > 0;
            const trailsExists = checkHiker2Result.rows[0][0] > 0;

            // NumofTrailsCompleted doesn't exist -> insert into Join_Hikers2
            if (!trailsExists) {
                const insertHikers2Query = `
                    INSERT INTO Join_Hikers2 (NumofTrailsCompleted, ExperienceLevel)
                    VALUES (:numOfTrailsCompleted, :experienceLevel)
                `;
                const insertHikers2Result = await connection.execute(insertHikers2Query, { numOfTrailsCompleted, experienceLevel }, { autoCommit: true });
                return insertHikers2Result.rowsAffected && insertHikers2Result.rowsAffected > 0;
            }
            
            return true;
        } catch (err) {
            console.error('Error inserting numOfTrailsCompleted into Join_Hikers2:', err);
            return false;
        }
    });
}


// 2.1.1-2 INSERT hiking club
async function insertHikingClub(clubEmail, name, numOfMembers) {
    if (!clubEmail || !name || numOfMembers == null) {
        console.error('Invalid input: Missing required attributes.');
        return false;
    }

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `INSERT INTO HikingClubs (ClubEmail, Name, NumofMembers)
                 VALUES (:clubEmail, :name, :numOfMembers)`,
                { clubEmail, name, numOfMembers },
                { autoCommit: true }
            );
            console.log('Inserted hiking club:', clubEmail);
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error inserting hiking club:', err.message);
            return false;
        }
    });
}


// 2.1.2-1 UPDATE hiker
async function updateHiker(hikerEmail, newName, newNumOfTrailsCompleted, newClubEmail) {
    if (!hikerEmail) {
        throw new Error('HikerEmail is required');
    }

    return await withOracleDB(async (connection) => {
        try {

            // Check if Hiker exists in Join_Hikers1
            const checkHikerQuery = `
                SELECT COUNT(*)
                FROM Join_Hikers1 
                WHERE HikerEmail = :hikerEmail
            `;
            const checkHikerResult = await connection.execute(checkHikerQuery, { hikerEmail });
            const hikerExists = checkHikerResult.rows[0][0] > 0;
            if (!hikerExists) {
                throw new Error('Hiker does not exist');
            }

            // Check if the new ClubEmail exists in HikingClubs
            if (newClubEmail) {
                const checkClubQuery = `
                    SELECT COUNT(*)
                    FROM HikingClubs 
                    WHERE ClubEmail = :clubEmail
                `;
                const checkClubResult = await connection.execute(checkClubQuery, { clubEmail: newClubEmail });
                const clubExists = checkClubResult.rows[0][0] > 0;
                if (!clubExists) {
                    throw new Error('Club does not exist');
                }
            }

            // get the hiker's original hiking club email
            const getOriginalHikeringClubQuery = `
                SELECT ClubEmail
                FROM Join_Hikers1 
                WHERE HikerEmail = :hikerEmail
            `;
            const originalClubResult = await connection.execute(getOriginalHikeringClubQuery, { hikerEmail });
            const originalClubEmail = (originalClubResult.rows.length > 0) ? originalClubResult.rows[0][0] : null;

            if (!originalClubEmail) {
                throw new Error('Original club not found for this hiker');
            }

            // if original club != new club, modify both clubs' NumofMembers
            if (newClubEmail !== originalClubEmail) {
                const modifyOriginalHikeringClubQuery = `
                    UPDATE HikingClubs 
                    SET NumofMembers = NumofMembers - 1 
                    WHERE ClubEmail = :originalClubEmail
                `;
                await connection.execute(modifyOriginalHikeringClubQuery, { originalClubEmail }, { autoCommit: true });

                const modifyNewHikeringClubQuery = `
                    UPDATE HikingClubs 
                    SET NumofMembers = NumofMembers + 1 
                    WHERE ClubEmail = :newClubEmail
                `;
                await connection.execute(modifyNewHikeringClubQuery, { newClubEmail }, { autoCommit: true });
            }

            // Get the new experience level based on the number of trails completed
            const newExperienceLevel = getExperienceLevel(newNumOfTrailsCompleted);

            // Check if the new NumofTrailsCompleted exists in Join_Hikers2
            const checkTrailsQuery = `
                SELECT COUNT(*)
                FROM Join_Hikers2 
                WHERE NumofTrailsCompleted = :newNumOfTrailsCompleted
            `;
            const checkTrailsResult = await connection.execute(checkTrailsQuery, { newNumOfTrailsCompleted });
            const trailsExists = checkTrailsResult.rows[0][0] > 0;

            // Insert into Join_Hikers2 if it doesn't exist
            if (!trailsExists) {
                const insertHikers2Query = `
                    INSERT INTO Join_Hikers2 (NumofTrailsCompleted, ExperienceLevel)
                    VALUES (:newNumOfTrailsCompleted, :newExperienceLevel)
                `;
                await connection.execute(insertHikers2Query, { newNumOfTrailsCompleted, newExperienceLevel }, { autoCommit: true });
            }

            // Update Join_Hikers1
            const updateHiker1Query = `
                UPDATE Join_Hikers1 
                SET Name = :newName, NumofTrailsCompleted = :newNumOfTrailsCompleted, ClubEmail = :newClubEmail 
                WHERE HikerEmail = :hikerEmail
            `;
            await connection.execute(updateHiker1Query, { newName, newNumOfTrailsCompleted, newClubEmail, hikerEmail }, { autoCommit: true });

            return true;
        } catch (err) {
            // Rollback the transaction in case of an error
            await connection.execute('ROLLBACK');
            console.error('Error updating hiker:', err.message);
            return false;
        }
    });
}


// 2.1.2-2 UPDATE hiking club
async function updateHikingClub(clubEmail, newName, newNumOfMembers) {
    if (!clubEmail) {
        console.error('Invalid input: Missing ClubEmail.');
        return false;
    }

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `UPDATE HikingClubs
                 SET Name = NVL(:newName, Name),
                     NumofMembers = NVL(:newNumOfMembers, NumofMembers)
                 WHERE ClubEmail = :clubEmail`,
                { clubEmail, newName, newNumOfMembers },
                { autoCommit: true }
            );
            console.log('Updated hiking club:', clubEmail);
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error updating hiking club:', err.message);
            return false;
        }
    });
}


// 2.1.3-1 DELETE hiker
async function deleteHiker(hikerEmail) {
    if (!hikerEmail) {
        console.error('Invalid input: HikerEmail is required for deletion.');
        return false;
    }

    return await withOracleDB(async (connection) => {
        try {
            // Delete the hiker
            const result = await connection.execute(
                `DELETE FROM Join_Hikers1 WHERE HikerEmail = :hikerEmail`,
                { hikerEmail },
                { autoCommit: true }
            );
            console.log(`Deleted hiker with HikerEmail: ${hikerEmail}`);
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error deleting hiker:', err.message);
            return false;
        }
    });
}

// 2.1.3-2 DELETE hiking club
async function deleteHikingClub(clubEmail) {
    if (!clubEmail) {
        console.error('Invalid input: ClubEmail is required for deletion.');
        return false;
    }

    return await withOracleDB(async (connection) => {
        try {
            // Delete the hiking club
            const result = await connection.execute(
                `DELETE FROM HikingClubs WHERE ClubEmail = :clubEmail`,
                { clubEmail },
                { autoCommit: true }
            );
            console.log(`Deleted hiking club with ClubEmail: ${clubEmail}`);
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error deleting hiking club:', err.message);
            return false;
        }
    });
}


// 2.1.4 SELECTION on hikers
async function fetchHikersWithConditions(conditions) {
    return await withOracleDB(async (connection) => {
        try {
            // Validate and construct the dynamic SQL query
            const { sqlQuery, bindParams } = parseAndValidateConditions(conditions);

            // Execute the constructed query
            const result = await connection.execute(sqlQuery, bindParams);

            // Format the result for frontend use
            const data = result.rows.map(row => ({
                hikerEmail: row[0],
                name: row[1],
                numOfTrailsCompleted: row[2],
                clubEmail: row[3]
            }));

            return { success: true, data };
        } catch (err) {
            console.error('Error fetching hikers with conditions:', err.message);
            return { success: false, message: err.message };
        }
    });
}

// Helper function to parse and validate user-provided conditions
function parseAndValidateConditions(conditions) {
    const validAttributes = ['HikerEmail', 'Name', 'NumofTrailsCompleted', 'ClubEmail'];
    const validOperators = ['=', '<', '>', '<=', '>=', '<>', 'LIKE'];
    const logicalOperators = ['AND', 'OR'];

    let sqlQuery = 'SELECT * FROM Join_Hikers1 WHERE ';
    const bindParams = {};
    let counter = 0;

    // Split conditions into clauses and parse each
    const clauses = conditions.split(/\s+(AND|OR)\s+/i);
    clauses.forEach((clause, index) => {
        if (logicalOperators.includes(clause.toUpperCase())) {
            // Add logical operators directly
            sqlQuery += ` ${clause.toUpperCase()} `;
        } else {
            // Parse attribute, operator, and value from the clause
            const match = clause.match(/(\w+)\s*(=|<|>|<=|>=|<>|LIKE)\s*(.+)/i);
            if (!match) {
                throw new Error(`Invalid condition: ${clause}`);
            }

            const [, attribute, operator, value] = match;

            // Validate attribute and operator
            if (!validAttributes.includes(attribute)) {
                throw new Error(`Invalid attribute: ${attribute}`);
            }
            if (!validOperators.includes(operator)) {
                throw new Error(`Invalid operator: ${operator}`);
            }

            // Add to SQL query and bind params
            const paramKey = `:param${counter}`;
            sqlQuery += `${attribute} ${operator} ${paramKey}`;
            bindParams[paramKey] = value.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            counter++;
        }
    });

    return { sqlQuery, bindParams };
}


// 2.1.5 PROJECTION on hikers
async function fetchProjectedAttributes(attributes) {
    return await withOracleDB(async (connection) => {
        try {
            // Validate the input attributes
            const validAttributes = ['HikerEmail', 'Name', 'NumofTrailsCompleted', 'ClubEmail'];
            const selectedAttributes = attributes.filter(attr => validAttributes.includes(attr));

            if (selectedAttributes.length === 0) {
                throw new Error('No valid attributes selected');
            }

            // Construct the SQL query dynamically
            const sqlQuery = `SELECT ${selectedAttributes.join(', ')} FROM Join_Hikers1`;

            // Execute the query
            const result = await connection.execute(sqlQuery);

            // Format the result for the frontend
            const data = result.rows.map(row => {
                const rowData = {};
                selectedAttributes.forEach((attr, index) => {
                    rowData[attr] = row[index];
                });
                return rowData;
            });

            return { success: true, data };
        } catch (err) {
            console.error('Error fetching projected attributes:', err.message);
            return { success: false, message: err.message };
        }
    });
}


// 2.1.6 JOIN on Join_Hikers1, Hike, and Have_Trails1
async function fetchHikersByTrailName(trailName) {
    return await withOracleDB(async (connection) => {
        try {
            // SQL query with bind parameter for security
            const sqlQuery = `
                SELECT h.HikerEmail, j.Name AS HikerName, t.Name AS TrailName
                FROM Join_Hikers1 j, Hike h, Have_Trails1 t
                WHERE j.HikerEmail = h.HikerEmail AND
                      h.Latitude = t.Latitude AND 
                      h.Longitude = t.Longitude AND
                      t.Name = :trailName
            `;

            // Execute the query with the provided trail name
            const result = await connection.execute(sqlQuery, { trailName });

            // Format the result into a user-friendly structure
            const data = result.rows.map(row => ({
                hikerEmail: row[0],
                hikerName: row[1],
                trailName: row[2],
            }));

            return { success: true, data };
        } catch (err) {
            console.error('Error fetching hikers by trail name:', err.message);
            return { success: false, message: err.message };
        }
    });
}


// 2.1.7 Aggregation with GROUP BY
//       -- Find the average number of trails completed by hikers for each experience level
async function getAvgTrailsByExperienceLevel() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(`
                SELECT ExperienceLevel, AVG(NumofTrailsCompleted) AS AVGNumofTrailsCompleted
                FROM Join_Hikers2
                GROUP BY ExperienceLevel
                ORDER BY ExperienceLevel
            `);

            // Map the result rows to a clean structure
            const data = result.rows.map(row => ({
                experienceLevel: row[0],
                avgNumOfTrailsCompleted: row[1]
            }));

            console.log('Average trails by experience level:', data);
            return { success: true, data };
        } catch (err) {
            console.error('Error fetching average trails by experience level:', err.message);
            return { success: false, message: err.message };
        }
    });
}


// 2.1.8 Aggregation with HAVING 
//       -- For each club having more than 50 members (big clubs), find the club email and
//          and the max number of trails completed by hikers in that club.
async function getMaxTrailsByClubWithMembersThreshold() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(`
                SELECT c.ClubEmail, MAX(h.NumofTrailsCompleted) AS MaxTrails
                FROM HikingClubs c, Join_Hikers1 h
                WHERE c.ClubEmail = h.ClubEmail
                GROUP BY c.ClubEmail
                HAVING SUM(c.NumofMembers) > 50
                ORDER BY c.ClubEmail ASC
            `);

            // Map the result rows to a clean structure
            const data = result.rows.map(row => ({
                clubEmail: row[0],
                maxTrailsCompleted: row[1]
            }));

            console.log('Max trails by club with member threshold:', data);
            return { success: true, data };
        } catch (err) {
            console.error('Error fetching max trails by club:', err.message);
            return { success: false, message: err.message };
        }
    });
}


// 2.1.9 Nested aggregation with GROUP BY
//       -- Find the hiker for each experience level whose number of completed trails is
//          greater than the average number of completed trails for that experience level.
async function getHikersWithHighestTrailsAndExperience() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(`
                SELECT h.HikerEmail, h.Name, h1.ExperienceLevel
                FROM Join_Hikers2 h1, Join_Hikers1 h
                WHERE h1.NumofTrailsCompleted = h.NumofTrailsCompleted
                  AND h1.NumofTrailsCompleted >= ALL (
                      SELECT AVG(h2.NumofTrailsCompleted)
                      FROM Join_Hikers2 h2
                      WHERE h2.ExperienceLevel = h1.ExperienceLevel
                      GROUP BY h2.ExperienceLevel
                  )
                ORDER BY h1.ExperienceLevel
            `);

            // Map the result rows to a clean structure
            const data = result.rows.map(row => ({
                hikerEmail: row[0],
                name: row[1],
                experienceLevel: row[2]
            }));

            console.log('Hikers with highest trails and experience:', data);
            return { success: true, data };
        } catch (err) {
            console.error('Error fetching hikers with highest trails and experience:', err.message);
            return { success: false, message: err.message };
        }
    });
}


// 2.1.10 Division
//        -- Find hikers who have hiked all the mountains.
async function getHikersWhoHikedAllMountains() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(`
                SELECT UNIQUE h.HikerEmail, j.Name 
                FROM Hike h, Join_Hikers1 j
                WHERE h.HikerEmail = j.HikerEmail AND NOT EXISTS (
                        (SELECT m.Latitude, m.Longitude
                         FROM Mountains m) -- 1. all mountains
                        MINUS  -- 3. all mountains that have not been hiked by hiker
                        (SELECT h2.Latitude, h2.Longitude
                         FROM Hike h2
                         WHERE h2.HikerEmail = h.HikerEmail) -- 2. all mountains hiked by hiker
                )
            `);

            // Map the result rows to a clean structure
            const data = result.rows.map(row => ({
                hikerEmail: row[0],
                name: row[1]
            }));

            console.log('Hikers who hiked all mountains:', data);
            return { success: true, data };
        } catch (err) {
            console.error('Error fetching hikers who hiked all mountains:', err.message);
            return { success: false, message: err.message };
        }
    });
}


module.exports = {
    testOracleConnection,
    initiateHikingClubs,
    fetchJoinHikersFromDb,
    fetchHikingClubsFromDb,
    fetchHaveTrailsFromDb,
    insertHiker,
    insertHikingClub,
    updateHiker,
    updateHikingClub,
    getAvgTrailsByExperienceLevel,
    deleteHiker,
    deleteHikingClub,
    getMaxTrailsByClubWithMembersThreshold,
    getHikersWithHighestTrailsAndExperience,
    getHikersWhoHikedAllMountains,
    fetchHikersWithConditions,
    fetchProjectedAttributes,
    fetchHikersByTrailName
};
