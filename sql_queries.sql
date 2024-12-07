-- 2.1.7 Aggregation with GROUP BY =======================================================
--- option 1
--           Find the average number of trails completed by hikers for each experience level
SELECT ExperienceLevel, AVG(NumofTrailsCompleted) AS AVGNumofTrailsCompleted
FROM Join_Hikers2
GROUP BY ExperienceLevel
ORDER BY ExperienceLevel;

-- --- option 2 (a bit similar to 2.1.8)
-- --           For each club, find the average number of trails completed by hikers.
-- SELECT ClubEmail, AVG(NumofTrailsCompleted) AS AVGNumofTrailsCompleted
-- FROM Join_Hikers1
-- GROUP BY ClubEmail
-- ORDER BY ClubEmail ASC;



-- 2.1.8 Aggregation with HAVING ==========================================================
--           For each club having more than 50 members (big clubs), find the club email
--           and the max number of trails completed by hikers in that club.
SELECT c.ClubEmail, MAX(h.NumofTrailsCompleted) AS MaxTrails
FROM HikingClubs c, Join_Hikers1 h
Where c.ClubEmail = h.ClubEmail
GROUP BY c.ClubEmail
HAVING SUM(c.NumofMembers) > 50
ORDER BY c.ClubEmail ASC;



-- 2.1.9 Nested aggregation with GROUP BY =================================================
--           Find the hiker for each experience level whose number of completed trails is
--           greater than the average number of completed trails for that experience level.
SELECT h.HikerEmail, h.Name, h1.ExperienceLevel
FROM Join_Hikers2 h1, Join_Hikers1 h
WHERE h1.NumofTrailsCompleted = h.NumofTrailsCompleted AND 
    h1.NumofTrailsCompleted >= ALL (
    SELECT AVG(h2.NumofTrailsCompleted)
    FROM Join_Hikers2 h2
    WHERE h2.ExperienceLevel = h1.ExperienceLevel
    GROUP BY h2.ExperienceLevel)  -- find the avg NumofTrailsCompleted per ExperienceLevel
ORDER BY h1.ExperienceLevel;



-- 2.1.10 Division ==========================================================================
--            Find hikers who have hiked all the mountains.
SELECT UNIQUE h.HikerEmail, j.Name 
FROM Hike h, Join_Hikers1 j
WHERE h.HikerEmail = j.HikerEmail AND NOT EXISTS (
        (SELECT m.Latitude, m.Longitude
         FROM Mountains m)  -- 1. all mountains
        MINUS  -- 3. all mountains that have not been hiked by hiker
        (SELECT h2.Latitude, h2.Longitude
         FROM Hike h2
         WHERE h2.HikerEmail = h.HikerEmail)  -- 2. all mountains hiked by hiker
);

-- -- Division: (option 2)
-- --            Find hiking clubs that have provided all types of emergency services
-- SELECT p.ClubEmail
-- FROM Provide p
-- WHERE NOT EXISTS
--         ((SELECT e.ServiceID
--           FROM EmergencyServices e)  -- 1. all types of emergency services
--           EXCEPT  -- 3. all emergency services that have not been provided by p
--           (SELECT p2.ServiceID
--            FROM Provide p2
--            WHERE p2.ClubEmail = p.ClubEmail))  -- 2. all emergency services provided by p