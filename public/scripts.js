/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// This function initiates the Join_Hikers1 and HikingClubs tables
async function initiateTables() {
    const response = await fetch('/initiate-hiking-clubs', {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('initiateResultMsg');
        messageElement.textContent = "Tables initiated successfully!";
        showTable('joinHikersTable', fetchAndDisplayJoinHikers);
        showTable('hikingClubsTable', fetchAndDisplayHikingClubs); // !!!
        showTable('haveTrailsTable', fetchAndDisplayHaveTrails);
    } else {
        alert("Error initiating tables!");
    }
}


async function insertHiker(event) {
    event.preventDefault();

        const hikerEmail = document.getElementById('insertHikerEmail').value;
        const name = document.getElementById('insertHikerName').value;
        const numTrails = document.getElementById('insertNumTrails').value;
        const clubEmail = document.getElementById('insertHikerClubEmail').value;

        try {
            const response = await fetch('/insert-hiker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hiker_email: hikerEmail, name, num_of_trails: numTrails, club_email: clubEmail })
            });

            const data = await response.json();
            console.log('Response from /insert-hiker:', data);

            const messageElement = document.getElementById('insertHikerResultMsg');
            if (data.success) {
                messageElement.textContent = 'Hiker inserted successfully!';
                messageElement.className = 'success';
                showTable('joinHikersTable', fetchAndDisplayJoinHikers);
            } else {
                messageElement.textContent = `Error inserting hiker: ${data.message || 'Unknown error'}`;
                messageElement.className = 'error';
            }
            messageElement.style.display = 'block';
        } catch (error) {
            console.error('Error inserting hiker:', error);
            const messageElement = document.getElementById('insertHikerResultMsg');
            messageElement.textContent = 'Error inserting hiker!';
            messageElement.className = 'error';
            messageElement.style.display = 'block';
        }
}

async function updateHiker(event) {
    event.preventDefault();

    const hikerEmail = document.getElementById('updateHikerEmail').value;
    const newName = document.getElementById('updateHikerName').value;
    const newNumTrails = document.getElementById('updateNumTrails').value;
    const newClubEmail = document.getElementById('updateHikerClubEmail').value;

    try {
        const response = await fetch('/update-hiker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hiker_email: hikerEmail, new_name: newName, new_num_of_trails: newNumTrails, new_club_email: newClubEmail })
        });
        const data = await response.json();

        const messageElement = document.getElementById('updateHikerResultMsg');
        if (data.success) {
            messageElement.textContent = 'Hiker updated successfully!';
            messageElement.className = 'success';
             showTable('joinHikersTable', fetchAndDisplayJoinHikers);
        } else {
            messageElement.textContent = 'Error updating hiker: ' + data.message;
            messageElement.className = 'error';
        }
        messageElement.style.display = 'block';
    } catch (error) {
        console.error('Error updating hiker:', error);
        const messageElement = document.getElementById('updateHikerResultMsg');
        messageElement.textContent = 'Error updating hiker!';
        messageElement.className = 'error';
        messageElement.style.display = 'block';
    }
}

async function fetchAndDisplayJoinHikers() {
    console.log("Fetching data from /join-hikers...");

    const table = document.getElementById('joinHikersTable');
    const tableBody = table.querySelector('tbody');

    try {
        // Make the GET request to fetch hikers data
        const response = await fetch('/join-hikers', { method: 'GET' });

        // Handle potential HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('Response from /join-hikers:', data);

        // Clear the current table body content
        tableBody.innerHTML = '';

        // Check if data retrieval was successful
        if (data.success && data.data.length > 0) {
            console.log(`Fetched ${data.data.length} hikers from the server.`);

            // Populate the table with the fetched data
            data.data.forEach((hiker, index) => {
                console.log(`Processing hiker #${index + 1}:`, hiker);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hiker[0] || 'N/A'}</td>
                    <td>${hiker[1] || 'N/A'}</td>
                    <td>${hiker[2] || 'N/A'}</td>
                    <td>${hiker[3] || 'N/A'}</td>
                    <td>${hiker[4] || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });

            table.style.display = 'table';
        } else {
            console.warn('No hikers found or data retrieval failed:', data.message || 'Unknown reason');
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching hikers:', error);
        alert(`Failed to fetch hikers. Error: ${error.message || 'Unknown error'}`);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Failed to fetch data</td></tr>';
    }
}

async function fetchAndDisplayHikingClubs() {
    console.log("Fetching data from /hiking-clubs...");

    const table = document.getElementById('hikingClubsTable');
    const tableBody = table.querySelector('tbody');

    try {
        // Make the GET request to fetch hikers data
        const response = await fetch('/hiking-clubs', { method: 'GET' });

        // Handle potential HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('Response from /hiking-clubs:', data);

        // Clear the current table body content
        tableBody.innerHTML = '';

        // Check if data retrieval was successful
        if (data.success && data.data.length > 0) {
            console.log(`Fetched ${data.data.length} hiking clubs from the server.`);

            // Populate the table with the fetched data
            data.data.forEach((hikingClub, index) => {
                console.log(`Processing hiking clubs #${index + 1}:`, hikingClub);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hikingClub[0] || 'N/A'}</td>
                    <td>${hikingClub[1] || 'N/A'}</td>
                    <td>${hikingClub[2] || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });

            table.style.display = 'table';
        } else {
            console.warn('No hiking clubs found or data retrieval failed:', data.message || 'Unknown reason');
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        // Log and alert in case of an error
        console.error('Error fetching hiking clubs:', error);
        alert(`Failed to fetch hiking clubs. Error: ${error.message || 'Unknown error'}`);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Failed to fetch data</td></tr>';
    }
}

async function fetchAndDisplayHaveTrails() {
    console.log("Fetching data from /have-trails...");

    const table = document.getElementById('haveTrailsTable');
    const tableBody = table.querySelector('tbody');

    try {
        const response = await fetch('/have-trails', { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response from /have-trails:', data);

        tableBody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            console.log(`Fetched ${data.data.length} trails from the server.`);

            data.data.forEach((trail, index) => {
                console.log(`Processing trail #${index + 1}:`, trail);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${trail[0] || 'N/A'}</td>
                    <td>${trail[1] || 'N/A'}</td>
                    <td>${trail[2] || 'N/A'}</td>
                    <td>${trail[3] || 'N/A'}</td>
                    <td>${trail[4] || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });

            table.style.display = 'table';
        } else {
            console.warn('No trails found or data retrieval failed:', data.message || 'Unknown reason');
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching trails:', error);
        alert(`Failed to fetch trails. Error: ${error.message || 'Unknown error'}`);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Failed to fetch data</td></tr>';
    }
}

async function insertHikingClub(event) {
    event.preventDefault();

    const clubEmail = document.getElementById('clubEmail').value;
    const clubName = document.getElementById('clubName').value;
    const numMembers = document.getElementById('numMembers').value;

    try {
        const response = await fetch('/insert-hiking-club', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ club_email: clubEmail, club_name: clubName, num_of_members: numMembers })
        });
        const data = await response.json();

        document.getElementById('insertHikingClubResultMsg').textContent = data.success
            ? 'Club inserted successfully!'
            : 'Error inserting club!';

    } catch (error) {
        console.error('Error inserting club:', error);
        document.getElementById('insertHikingClubResultMsg').textContent = 'Error inserting club!';
    }
}

async function deleteHikingClub(event) {
    event.preventDefault();

    const clubEmail = document.getElementById('deleteClubEmail').value;

    try {
        const response = await fetch('/delete-hiking-club', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ club_email: clubEmail })
        });

        const data = await response.json();
        const messageElement = document.getElementById('deleteHikingClubResultMsg');
        if (data.success) {
            messageElement.textContent = 'Hiking club deleted successfully!';
            messageElement.className = 'success';
            showTable('joinHikersTable', fetchAndDisplayJoinHikers)
        } else {
            messageElement.textContent = 'Error deleting hiking club!';
            messageElement.className = 'error';
        }
        messageElement.style.display = 'block';
    } catch (error) {
        console.error('Error deleting hiking club:', error);
        const messageElement = document.getElementById('deleteHikingClubResultMsg');
        messageElement.textContent = 'Error deleting hiking club!';
        messageElement.className = 'error';
        messageElement.style.display = 'block';
    }
}

async function deleteHiker(event) {
    event.preventDefault();

    const hikerEmail = document.getElementById('deleteHikerEmail').value;

    try {
        const response = await fetch('/delete-hiker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hiker_email: hikerEmail })
        });

        const data = await response.json();
        const messageElement = document.getElementById('deleteHikerResultMsg');
        if (data.success) {
            messageElement.textContent = 'Hiker deleted successfully!';
            messageElement.className = 'success';
            showTable('joinHikersTable', fetchAndDisplayJoinHikers)
        } else {
            messageElement.textContent = 'Error deleting hiker!';
            messageElement.className = 'error';
        }
        messageElement.style.display = 'block';
    } catch (error) {
        console.error('Error deleting hiker:', error);
        const messageElement = document.getElementById('deleteHikerResultMsg');
        messageElement.textContent = 'Error deleting hiker!';
        messageElement.className = 'error';
        messageElement.style.display = 'block';
    }
}

async function fetchAndDisplayAvgTrails() {
    const table = document.getElementById('avgTrailsTable');
    try {
        const response = await fetch('/avg-trails-by-experience', { method: 'GET' });
        const data = await response.json();

        const tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(trail => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${trail.experienceLevel}</td>
                    <td>${trail.avgNumOfTrailsCompleted.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching average trails:', error);
        alert('Failed to fetch average trails. Please try again later.');
    }
}

async function fetchAndDisplayMaxTrails() {
    const table = document.getElementById('maxTrailsTable');
    try {
        const response = await fetch('/max-trails-by-club', { method: 'GET' });
        const data = await response.json();

        const tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(trail => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${trail.clubEmail}</td>
                    <td>${trail.maxTrailsCompleted}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching maximum trails:', error);
        alert('Failed to fetch maximum trails. Please try again later.');
    }
}

async function fetchAndDisplayHighestTrails() {
    const table = document.getElementById('hikersHighestTrailsTable');
    try {
        const response = await fetch('/hikers-highest-trails', { method: 'GET' });
        const data = await response.json();

        const tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(hiker => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hiker.hikerEmail}</td>
                    <td>${hiker.name}</td>
                    <td>${hiker.experienceLevel}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching hikers with highest trails:', error);
        alert('Failed to fetch hikers. Please try again later.');
    }
}

async function fetchAndDisplayAllMountains() {
    const table = document.getElementById('hikersAllMountainsTable');
    try {
        const response = await fetch('/hikers-all-mountains', { method: 'GET' });
        const data = await response.json();

        const tableBody = table.querySelector('tbody');
        tableBody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(hiker => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hiker.hikerEmail}</td>
                    <td>${hiker.name}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching hikers who hiked all mountains:', error);
        alert('Failed to fetch data. Please try again later.');
    }
}

function showTable(tableId, fetchFunction) {
    // Hide all tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        table.style.display = 'none';
    });

    // Show the selected table
    const table = document.getElementById(tableId);
    table.style.display = 'table';

    // Fetch and display data for the selected table
    fetchFunction();
}
async function searchHikers(event) {
    event.preventDefault();

    const conditions = document.getElementById('searchConditions').value;
    const table = document.getElementById('searchResultsTable');
    const tableBody = table.querySelector('tbody');
    const messageElement = document.getElementById('searchResultMsg');

    try {
        const response = await fetch('/hikers-with-conditions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conditions })
        });

        const data = await response.json();

        if (data.success && data.data.length > 0) {
            tableBody.innerHTML = '';
            data.data.forEach((hiker) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hiker.hikerEmail || 'N/A'}</td>
                    <td>${hiker.name || 'N/A'}</td>
                    <td>${hiker.numOfTrailsCompleted || 'N/A'}</td>
                    <td>${hiker.clubEmail || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });

            table.style.display = 'table';
            messageElement.style.display = 'none';
        } else {
            table.style.display = 'none';
            messageElement.textContent = 'No results found.';
            messageElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Error searching hikers:', error);
        table.style.display = 'none';
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.style.display = 'block';
    }
}

async function fetchProjection(event) {
    event.preventDefault();

    // Get selected attributes
    const checkboxes = document.querySelectorAll('#projectionForm input[type="checkbox"]:checked');
    const attributes = Array.from(checkboxes).map(checkbox => checkbox.value);

    const table = document.getElementById('projectionTable');
    const tableHeader = document.getElementById('projectionTableHeader');
    const tableBody = table.querySelector('tbody');
    const messageElement = document.getElementById('projectionResultMsg');

    try {
        // Send the selected attributes to the server
        const response = await fetch('/project-attributes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attributes })
        });

        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Populate the table header
            tableHeader.innerHTML = '';
            attributes.forEach(attr => {
                const th = document.createElement('th');
                th.textContent = attr;
                tableHeader.appendChild(th);
            });

            // Populate the table body
            tableBody.innerHTML = '';
            data.data.forEach(row => {
                const tr = document.createElement('tr');
                attributes.forEach(attr => {
                    const td = document.createElement('td');
                    td.textContent = row[attr] || 'N/A';
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });

            table.style.display = 'table';
            messageElement.style.display = 'none';
        } else {
            table.style.display = 'none';
            messageElement.textContent = 'No results found.';
            messageElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching projection:', error);
        table.style.display = 'none';
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.style.display = 'block';
    }
}

async function fetchHikersByTrail(event) {
    event.preventDefault();

    const trailName = document.getElementById('trailName').value;
    const table = document.getElementById('hikersByTrailTable');
    const tableBody = table.querySelector('tbody');
    const messageElement = document.getElementById('hikersByTrailResultMsg');

    try {
        const response = await fetch('/hikers-by-trail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trailName }),
        });

        const data = await response.json();

        if (data.success && data.data.length > 0) {
            tableBody.innerHTML = '';
            data.data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.hikerEmail || 'N/A'}</td>
                    <td>${row.hikerName || 'N/A'}</td>
                    <td>${row.trailName || 'N/A'}</td>
                `;
                tableBody.appendChild(tr);
            });

            table.style.display = 'table';
            messageElement.style.display = 'none';
        } else {
            table.style.display = 'none';
            messageElement.textContent = 'No results found.';
            messageElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching hikers by trail name:', error);
        table.style.display = 'none';
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.style.display = 'block';
    }
}

window.onload = () => {
    checkDbConnection();
    showTable('joinHikersTable', fetchAndDisplayJoinHikers);
    showTable('hikingClubsTable', fetchAndDisplayHikingClubs);
    showTable('haveTrailsTable', fetchAndDisplayHaveTrails);
    document.getElementById('insertHikerForm').addEventListener('submit', insertHiker);
    document.getElementById('initiateTables').addEventListener('click', initiateTables);
    document.getElementById('updateHikerForm').addEventListener('submit', updateHiker);
    document.getElementById('deleteHikerForm').addEventListener('submit', deleteHiker);
    document.getElementById('insertHikingClubForm').addEventListener('submit', insertHikingClub);
    document.getElementById('deleteHikingClubForm').addEventListener('submit', deleteHikingClub);
    document.getElementById('searchHikersForm').addEventListener('submit', searchHikers);
    document.getElementById('projectionForm').addEventListener('submit', fetchProjection);
    document.getElementById('hikersByTrailForm').addEventListener('submit', fetchHikersByTrail);
};