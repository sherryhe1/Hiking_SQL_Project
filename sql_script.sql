--------- SQL DDL statements required to create all the tables ---------

CREATE TABLE HikingClubs(
    ClubEmail VARCHAR(40) PRIMARY KEY,
    Name VARCHAR(20),
    NumofMembers INTEGER
);

CREATE TABLE EmergencyServices(
    ServiceID INTEGER PRIMARY KEY,
    ServiceType VARCHAR(40),
    ServiceDate Date
);

CREATE TABLE Provide(
    ClubEmail VARCHAR(40),
    ServiceID INTEGER,
    PRIMARY KEY (ClubEmail, ServiceID),
    FOREIGN KEY (ClubEmail) REFERENCES HikingClubs ON DELETE CASCADE, -- ON UPDATE CASCADE,
    FOREIGN KEY (ServiceID) REFERENCES EmergencyServices ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Provide_TrekkingPoles2(
    Brand VARCHAR(40),
    Name VARCHAR(40),
    Price FLOAT,
    PRIMARY KEY (Brand, Name)
);

CREATE TABLE Provide_TrekkingPoles1(
    tpID INTEGER PRIMARY KEY,
    Brand VARCHAR(40),
    Name VARCHAR(40),
    ClubEmail VARCHAR(40),
    FOREIGN KEY (ClubEmail) REFERENCES HikingClubs ON DELETE CASCADE, -- ON UPDATE CASCADE
    FOREIGN KEY (Brand, Name) REFERENCES Provide_TrekkingPoles2 ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Have_Organizers2(
    NumofEventsOrganized INTEGER PRIMARY KEY,
    ExperienceLevel CHAR(12)
);

CREATE TABLE Have_Organizers1(
    OrganizerEmail VARCHAR(40) PRIMARY KEY,
    Name VARCHAR(20),
    NumofEventsOrganized INTEGER,
    ClubEmail VARCHAR(40),
    FOREIGN KEY (ClubEmail) REFERENCES HikingClubs ON DELETE SET NULL, -- ON UPDATE CASCADE
    FOREIGN KEY (NumofEventsOrganized) REFERENCES Have_Organizers2 ON DELETE SET NULL -- ON UPDATE CASCADE
);

CREATE TABLE Schedule_ClubHikingEvents(
    EventID INTEGER PRIMARY KEY,
    DateTime TIMESTAMP,
    MountainName VARCHAR(40),
    OrganizerEmail VARCHAR(40) NOT NULL,
    FOREIGN KEY (OrganizerEmail) REFERENCES Have_Organizers1 ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Join_Hikers2(
    NumofTrailsCompleted INTEGER PRIMARY KEY,
    ExperienceLevel CHAR(12)
);

CREATE TABLE Join_Hikers1(
    HikerEmail VARCHAR(40) PRIMARY KEY,
    Name VARCHAR(20),
    NumofTrailsCompleted INTEGER,
    ClubEmail VARCHAR(40),
    FOREIGN KEY (ClubEmail) REFERENCES HikingClubs ON DELETE SET NULL, -- ON UPDATE CASCADE
    FOREIGN KEY (NumofTrailsCompleted) REFERENCES Join_Hikers2 ON DELETE SET NULL -- ON UPDATE CASCADE
);

CREATE TABLE Participate(
    HikerEmail VARCHAR(40),
    EventID INTEGER,
    PRIMARY KEY (HikerEmail, EventID),
    FOREIGN KEY (HikerEmail) REFERENCES Join_Hikers1 ON DELETE CASCADE, -- ON UPDATE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Schedule_ClubHikingEvents ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Mountains(
    Latitude DECIMAL(8,6),
    Longitude DECIMAL(9,6),
    Name VARCHAR(70),
    PRIMARY KEY (Latitude, Longitude)
);

CREATE TABLE Have_Trails2(
    ElevationGain INTEGER PRIMARY KEY,
    DifficultyLevel CHAR(8)
);

CREATE TABLE Have_Trails1(
    Latitude DECIMAL(8,6),
    Longitude DECIMAL(9,6),
    Name VARCHAR(70),
    ElevationGain INTEGER,
    Distance FLOAT,
    EstimatedTime INTERVAL DAY TO SECOND, -- !!!
    PRIMARY KEY (Latitude, Longitude, Name),
    FOREIGN KEY (Latitude, Longitude) REFERENCES Mountains ON DELETE CASCADE, -- ON UPDATE CASCADE
    FOREIGN KEY (ElevationGain) REFERENCES Have_Trails2 ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Hike(
    HikerEmail VARCHAR(40),
    Latitude DECIMAL(8,6),
    Longitude DECIMAL(9,6),
    CompletionTime INTERVAL DAY TO SECOND, -- !!!
    PRIMARY KEY (HikerEmail, Latitude, Longitude),
    FOREIGN KEY (HikerEmail) REFERENCES Join_Hikers1 ON DELETE CASCADE, -- ON UPDATE CASCADE,
    FOREIGN KEY (Latitude, Longitude) REFERENCES Mountains ON DELETE SET NULL -- ON UPDATE CASCADE
);

CREATE TABLE HikersWithCars(
    HikerEmail VARCHAR(40) PRIMARY KEY,
    NumofSeatsAvailable INTEGER,
    FOREIGN KEY (HikerEmail) REFERENCES Join_Hikers1 ON DELETE CASCADE -- ON UPDATE CASCADE
);

CREATE TABLE Carpool_HikersWithoutCars(
    HikerEmailWithoutCar VARCHAR(40) PRIMARY KEY,
    HikerEmailWithCar VARCHAR(40),
    FOREIGN KEY (HikerEmailWithoutCar) REFERENCES Join_Hikers1 ON DELETE CASCADE, -- ON UPDATE CASCADE,
    FOREIGN KEY (HikerEmailWithCar) REFERENCES Join_Hikers1 ON DELETE CASCADE -- ON UPDATE CASCADE
);


--------- INSERT statements to populate each table with at least 5 tuples ---------

INSERT INTO HikingClubs
VALUES ('AlpineClub123@gmail.com', 'Alpine', 10);
INSERT INTO HikingClubs
VALUES ('BigHikingClub01@gmail.com', 'Big Hiking Club', 370);
INSERT INTO HikingClubs
VALUES ('RidgeInfo@gmail.com', 'Ridge Hiking Club', 63);
INSERT INTO HikingClubs
VALUES ('OutdoorClub@gmail.com', 'Outdoor Club', 150);
INSERT INTO HikingClubs
VALUES ('Info@outdoor.ca', 'Outdoor Hiking Club', 63);
INSERT INTO HikingClubs
VALUES ('AlpineHikers@gmail.com', 'Alpine', 25);

INSERT INTO EmergencyServices
VALUES (1, 'Search and Rescue', DATE '2017-01-10');
INSERT INTO EmergencyServices
VALUES (2, 'Emergency Medical Services', DATE '2019-03-08');
INSERT INTO EmergencyServices
VALUES (13, 'Helicopter Rescue Services', DATE '2020-11-07');
INSERT INTO EmergencyServices
VALUES (16, 'Search and Rescue', DATE '2020-11-07');
INSERT INTO EmergencyServices
VALUES (20, 'Search and Rescue', DATE '2020-11-07');
INSERT INTO EmergencyServices
VALUES (100, 'Emergency Medical Services', DATE '2024-10-15');

INSERT INTO Provide
VALUES ('AlpineClub123@gmail.com', 2);
INSERT INTO Provide
VALUES ('BigHikingClub01@gmail.com', 1);
INSERT INTO Provide
VALUES ('RidgeInfo@gmail.com', 13);
INSERT INTO Provide
VALUES ('OutdoorClub@gmail.com', 100);
INSERT INTO Provide
VALUES ('AlpineHikers@gmail.com', 16);

INSERT INTO Provide_TrekkingPoles2
VALUES ('Black Diamond', 'Trail Trek Poles - Women', 108.94);
INSERT INTO Provide_TrekkingPoles2
VALUES ('Black Diamond', 'Explorer 3 Trekking Poles', 99.95);
INSERT INTO Provide_TrekkingPoles2
VALUES ('Salomon', 'Hacker', 59.95);
INSERT INTO Provide_TrekkingPoles2
VALUES ('Cline', 'Collapsible Trekking Pole', 24.99);
INSERT INTO Provide_TrekkingPoles2
VALUES ('TheFitLife', 'Nordic Walking Trekking Poles', 39.98);

INSERT INTO Provide_TrekkingPoles1
VALUES (1, 'Black Diamond', 'Trail Trek Poles - Women', 'AlpineClub123@gmail.com');
INSERT INTO Provide_TrekkingPoles1
VALUES (3, 'Black Diamond', 'Explorer 3 Trekking Poles', 'AlpineClub123@gmail.com');
INSERT INTO Provide_TrekkingPoles1
VALUES (4, 'Salomon', 'Hacker', 'BigHikingClub01@gmail.com');
INSERT INTO Provide_TrekkingPoles1
VALUES (10, 'Cline', 'Collapsible Trekking Pole', 'RidgeInfo@gmail.com');
INSERT INTO Provide_TrekkingPoles1
VALUES (21, 'TheFitLife', 'Nordic Walking Trekking Poles', 'AlpineHikers@gmail.com');

INSERT INTO Have_Organizers2
VALUES (10, 'junior');
INSERT INTO Have_Organizers2
VALUES (9, 'junior');
INSERT INTO Have_Organizers2
VALUES (123, 'senior');
INSERT INTO Have_Organizers2
VALUES (50, 'intermediate');
INSERT INTO Have_Organizers2
VALUES (23, 'junior');
INSERT INTO Have_Organizers2
VALUES (7, 'junior');
INSERT INTO Have_Organizers2
VALUES (66, 'intermediate');

INSERT INTO Have_Organizers1
VALUES ('angie456@gmail.com', 'Angie', 10, 'AlpineClub123@gmail.com');
INSERT INTO Have_Organizers1
VALUES ('2angie@gmail.com', 'Angie', 9, 'AlpineClub123@gmail.com');
INSERT INTO Have_Organizers1
VALUES ('gtp789@gmail.com', 'Lena', 123, 'BigHikingClub01@gmail.com');
INSERT INTO Have_Organizers1
VALUES ('andrew1@gmail.com', 'Andrew', 50, 'RidgeInfo@gmail.com');
INSERT INTO Have_Organizers1
VALUES ('luc556@gmail.com', 'Lucas', 23, 'OutdoorClub@gmail.com');
INSERT INTO Have_Organizers1
VALUES ('oliver@gmail.com', 'Oliver', 7, 'Info@outdoor.ca');
INSERT INTO Have_Organizers1
VALUES ('mmia8@gmail.com', 'Mia', 66, 'AlpineHikers@gmail.com');

INSERT INTO Schedule_ClubHikingEvents
VALUES (1, TIMESTAMP '2017-01-10 13:00:00', 'Stanley Park', '2angie@gmail.com');
INSERT INTO Schedule_ClubHikingEvents
VALUES (5, TIMESTAMP '2017-01-10 14:25:00', 'Stanley Park', 'gtp789@gmail.com');
INSERT INTO Schedule_ClubHikingEvents
VALUES (100, TIMESTAMP '2020-11-07 08:30:00', 'Stawamus Chief Provincial Park', 'angie456@gmail.com');
INSERT INTO Schedule_ClubHikingEvents
VALUES (116, TIMESTAMP '2022-08-16 07:00:00', 'Stawamus Chief Provincial Park', 'mmia8@gmail.com');
INSERT INTO Schedule_ClubHikingEvents
VALUES (202, TIMESTAMP '2024-09-25 10:45:00', 'Burnaby Mountain', 'oliver@gmail.com');

INSERT INTO Join_Hikers2
VALUES (3, 'junior');
INSERT INTO Join_Hikers2
VALUES (25, 'intermediate');
INSERT INTO Join_Hikers2
VALUES (40, 'senior');
INSERT INTO Join_Hikers2
VALUES (29, 'intermediate');
INSERT INTO Join_Hikers2
VALUES (60, 'senior');
INSERT INTO Join_Hikers2
VALUES (14, 'junior');
INSERT INTO Join_Hikers2
VALUES (51, 'senior');
INSERT INTO Join_Hikers2
VALUES (9, 'junior');
INSERT INTO Join_Hikers2
VALUES (27, 'intermediate');
INSERT INTO Join_Hikers2
VALUES (50, 'senior');

INSERT INTO Join_Hikers1
VALUES ('8leo9@gmail.com', 'Leo', 3, 'AlpineClub123@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('olivia20@gmail.com', 'Olivia', 25, 'BigHikingClub01@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('ttpp11@gmail.com', 'Emily', 40, 'BigHikingClub01@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('henry0@gmail.com', 'Henry', 29, 'RidgeInfo@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('sophia55@gmail.com', 'Sophia', 60, 'OutdoorClub@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('will678@gmail.com', 'William', 14, 'Info@outdoor.ca');
INSERT INTO Join_Hikers1
VALUES ('emma@gmail.com', 'Emma', 51, 'AlpineHikers@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('noah56@gmail.com', 'Noah', 9, 'AlpineHikers@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('amelia10@gmail.com', 'Amelia', 27, 'RidgeInfo@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('kathy3@gmail.com', 'Kathy', 50, 'RidgeInfo@gmail.com');
INSERT INTO Join_Hikers1
VALUES ('kk02@gmail.com', 'Kathy', 3, 'RidgeInfo@gmail.com');

INSERT INTO Participate
VALUES ('8leo9@gmail.com', 5);
INSERT INTO Participate
VALUES ('olivia20@gmail.com', 5);
INSERT INTO Participate
VALUES ('ttpp11@gmail.com', 116);
INSERT INTO Participate
VALUES ('ttpp11@gmail.com', 202);
INSERT INTO Participate
VALUES ('sophia55@gmail.com', 100);

INSERT INTO Mountains
VALUES (49.299999, -123.139999, 'Stanley Park');
INSERT INTO Mountains
VALUES (49.331602, -123.263650, 'Lighthouse Park');
INSERT INTO Mountains
VALUES (49.686389, -123.136944, 'Stawamus Chief Provincial Park');
INSERT INTO Mountains
VALUES (49.954213, -123.013532, 'Panorama Ridge');
INSERT INTO Mountains
VALUES (49.279369, -122.908605, 'Burnaby Mountain');

INSERT INTO Have_Trails2
VALUES (249, 'easy');
INSERT INTO Have_Trails2
VALUES (337, 'easy');
INSERT INTO Have_Trails2
VALUES (3136, 'hard');
INSERT INTO Have_Trails2
VALUES (2142, 'hard');
INSERT INTO Have_Trails2
VALUES (1486, 'moderate');

INSERT INTO Have_Trails1
VALUES (49.299999, -123.139999, 'Stanley Park Seawall', 249, 6.0, INTERVAL '01:58:00' HOUR TO SECOND);
INSERT INTO Have_Trails1
VALUES (49.299999, -123.139999, 'Stanley Park Inner Loop', 337, 4.9, INTERVAL '01:45:00' HOUR TO SECOND);
INSERT INTO Have_Trails1
VALUES (49.686389, -123.136944, 'Sea to Summit Trail', 3136, 7.2, INTERVAL '05:23:00' HOUR TO SECOND);
INSERT INTO Have_Trails1
VALUES (49.686389, -123.136944, 'Stawamus Chief First, Second, Thrid Peak Loop', 2142, 3.6, INTERVAL '04:50:00' HOUR TO SECOND);
INSERT INTO Have_Trails1
VALUES (49.279369, -122.908605, 'Burnaby Mountain Park Loop', 1486, 6.9, INTERVAL '03:32:00' HOUR TO SECOND);

INSERT INTO Hike
VALUES ('8leo9@gmail.com', 49.299999, -123.139999, INTERVAL '02:00:00' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('olivia20@gmail.com', 49.299999, -123.139999, INTERVAL '01:45:23' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('ttpp11@gmail.com', 49.686389, -123.136944, INTERVAL '05:47:11' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('henry0@gmail.com', 49.686389, -123.136944, INTERVAL '05:01:00' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('sophia55@gmail.com', 49.299999, -123.139999, INTERVAL '01:35:05' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('sophia55@gmail.com', 49.331602, -123.263650, INTERVAL '04:50:10' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('sophia55@gmail.com', 49.686389, -123.136944, INTERVAL '04:30:03' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('sophia55@gmail.com', 49.954213, -123.013532, INTERVAL '02:34:05' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('sophia55@gmail.com', 49.279369, -122.908605, INTERVAL '03:55:03' HOUR TO SECOND);
-- !!!
INSERT INTO Hike
VALUES ('emma@gmail.com', 49.299999, -123.139999, INTERVAL '01:30:05' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('emma@gmail.com', 49.331602, -123.263650, INTERVAL '04:55:11' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('emma@gmail.com', 49.686389, -123.136944, INTERVAL '04:27:02' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('emma@gmail.com', 49.954213, -123.013532, INTERVAL '02:31:05' HOUR TO SECOND);
INSERT INTO Hike
VALUES ('emma@gmail.com', 49.279369, -122.908605, INTERVAL '03:27:04' HOUR TO SECOND);

INSERT INTO HikersWithCars
VALUES ('8leo9@gmail.com', 2);
INSERT INTO HikersWithCars
VALUES ('olivia20@gmail.com', 3);
INSERT INTO HikersWithCars
VALUES ('ttpp11@gmail.com', 2);
INSERT INTO HikersWithCars
VALUES ('henry0@gmail.com', 4);
INSERT INTO HikersWithCars
VALUES ('sophia55@gmail.com', 2);

INSERT INTO Carpool_HikersWithoutCars
VALUES ('will678@gmail.com', '8leo9@gmail.com');
INSERT INTO Carpool_HikersWithoutCars
VALUES ('emma@gmail.com', '8leo9@gmail.com');
INSERT INTO Carpool_HikersWithoutCars
VALUES ('noah56@gmail.com', 'ttpp11@gmail.com');
INSERT INTO Carpool_HikersWithoutCars
VALUES ('amelia10@gmail.com', 'henry0@gmail.com');
INSERT INTO Carpool_HikersWithoutCars
VALUES ('kathy3@gmail.com', 'henry0@gmail.com');