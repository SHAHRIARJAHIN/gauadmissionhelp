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
            marker.bindPopup(`<b>Building:</b> ${location.building}<br><b>Floor:</b> ${location.floor}<br><b>Room:</b> ${location.room}`).openPopup();

            // Pan the map to the location
            map.setView([location.lat, location.lng], 17);

            // Store the selected location for the directions button
            selectedLocation = location;

            // Show the "Get Directions" button
            document.getElementById("directionButton").style.display = "block";

            found = true;
        }
    });

    if (!found) {
        alert("Roll number not found in the database.");
        // Hide the "Get Directions" button
        document.getElementById("directionButton").style.display = "none";
    }
}

// Function to open Google Maps with directions
function openGoogleMaps() {
    if (selectedLocation) {
        // Construct the Google Maps direction URL
        var googleMapsURL = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
        // Open the URL in a new tab or redirect the user
        window.open(googleMapsURL, '_blank');
    }
}
