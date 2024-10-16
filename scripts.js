// Initialize the map with a default location (center of campus)
var map = L.map('map').setView([24.036253972589652, 90.3977985470635], 16);

// Google Maps tile layer
var googleMapsLayer = L.tileLayer(`https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`, {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
}).addTo(map);

// Replace "YOUR_GOOGLE_MAPS_API_KEY" with your actual Google Maps API Key
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSayNjEzlZUEQAedk3MVKbIkDZP5yEFAhfBTpUabm69vDHXEDseswF7a9NUi-kQKqZg-YBYpjBLjwBl/pub?gid=0&single=true&output=csv';

// Fetch and parse Google Sheet data
let locations = [];
let selectedLocation = null; // Store the selected location for Google Maps redirection
fetch(googleSheetURL)
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        rows.forEach(row => {
            const [building, floor, room, rollFrom, rollTo, lat, lng] = row.split(",");
            locations.push({
                building: building.trim(),
                floor: floor.trim(),
                room: room.trim(),
                rollFrom: parseInt(rollFrom),
                rollTo: parseInt(rollTo),
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            });
        });
    });

// Function to find the location based on roll number input
function findLocation() {
    var rollNumber = document.getElementById("rollNumberInput").value;
    var found = false;

    locations.forEach(function (location) {
        if (rollNumber >= location.rollFrom && rollNumber <= location.rollTo) {
            // Clear previous markers
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add marker for the found location
            var marker = L.marker([location.lat, location.lng]).addTo(map);

            // Create the popup with "Open in Maps" button
            var popupContent = `
                <b>Building:</b> ${location.building}<br>
                <b>Floor:</b> ${location.floor}<br>
                <b>Room:</b> ${location.room}<br><br>
                <button id="popupButton" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    font-weight: bold;
                    background-color: #4285F4;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                " onclick="openGoogleMapsFromPopup(${location.lat}, ${location.lng})">
                    Open in Maps
                </button>
            `;

            marker.bindPopup(popupContent).openPopup();

            // Pan the map to the location
            map.setView([location.lat, location.lng], 17);

            // Scroll to the map area smoothly
            document.getElementById('map').scrollIntoView({ behavior: 'smooth' });

            found = true;
        }
    });

    if (!found) {
        alert("Roll number not found in the database.");
    }
}

// Function to open Google Maps with directions from the popup
function openGoogleMapsFromPopup(lat, lng) {
    var googleMapsURL = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsURL, '_blank');
}
window.addEventListener('load', function() {
    // Hide the preloader
    document.getElementById('preloader').style.display = 'none';

    // Show the content
    document.getElementById('content').style.display = 'block';
});
