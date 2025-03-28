// Translations object
const translations = {
    en: {
        title: "Find Your Exam Room Location",
        placeholder: "Enter Roll Number",
        findBtn: "Find Location",
        directionBtn: "Get Directions",
        notFound: "Roll number not found in the database.",
        building: "Building",
        floor: "Floor",
        room: "Room",
        listenPrompt: "Speak your roll number now",
        voiceNotSupported: "Voice search is not supported in your browser",
        permissionDenied: "Microphone permission denied"
    },
    bn: {
        title: "আপনার পরীক্ষার রুমের অবস্থান খুঁজুন",
        placeholder: "রোল নম্বর লিখুন",
        findBtn: "অবস্থান খুঁজুন",
        directionBtn: "দিকনির্দেশনা পান",
        notFound: "ডাটাবেসে রোল নম্বর পাওয়া যায়নি।",
        building: "ভবন",
        floor: "তলা",
        room: "রুম",
        listenPrompt: "এখন আপনার রোল নম্বর বলুন",
        voiceNotSupported: "আপনার ব্রাউজারে ভয়েস অনুসন্ধান সমর্থিত নয়",
        permissionDenied: "মাইক্রোফোন অনুমতি অস্বীকার করা হয়েছে"
    }
};

// Initialize variables
let currentLanguage = 'en';
let isDarkMode = false;
let locations = [];
let selectedLocation = null;
let map;
let speechSynthesis = window.speechSynthesis;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadLocations();
    setupEventListeners();
    translatePage(currentLanguage);
});

// Initialize the map
function initializeMap() {
    map = L.map('map').setView([24.036253972589652, 90.3977985470635], 16);
    
    L.tileLayer(`https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
    }).addTo(map);
}

// Load locations from Google Sheet
function loadLocations() {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSayNjEzlZUEQAedk3MVKbIkDZP5yEFAhfBTpUabm69vDHXEDseswF7a9NUi-kQKqZg-YBYpjBLjwBl/pub?gid=0&single=true&output=csv';
    
    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\n").slice(1);
            locations = rows.map(row => {
                const [building, floor, room, rollFrom, rollTo, lat, lng] = row.split(",");
                return {
                    building: building.trim(),
                    floor: floor.trim(),
                    room: room.trim(),
                    rollFrom: parseInt(rollFrom),
                    rollTo: parseInt(rollTo),
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                };
            });
        })
        .catch(error => console.error('Error loading locations:', error));
}

// Set up event listeners
function setupEventListeners() {
    // Real-time search
    const rollNumberInput = document.getElementById('rollNumberInput');
    rollNumberInput.addEventListener('input', handleRealTimeSearch);
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Voice search
    const voiceSearch = document.getElementById('voiceSearch');
    voiceSearch.addEventListener('click', startVoiceSearch);
    
    // Speak results
    const speakResults = document.getElementById('speakResults');
    speakResults.addEventListener('click', speakLocationDetails);
    
    // Language toggle
    const languageToggles = document.querySelectorAll('.language-btn');
    languageToggles.forEach(button => {
        button.addEventListener('click', () => toggleLanguage(button.dataset.lang));
    });
}

// Handle real-time search (after 5 digits)
function handleRealTimeSearch() {
    const rollNumber = document.getElementById('rollNumberInput').value;
    if (rollNumber.length === 5) {
        findLocation();
    }
}

// Find location based on roll number
function findLocation() {
    const rollNumber = parseInt(document.getElementById('rollNumberInput').value);
    const foundLocation = locations.find(loc => rollNumber >= loc.rollFrom && rollNumber <= loc.rollTo);
    
    // Clear previous markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    // Hide buttons initially
    document.getElementById('directionButton').style.display = 'none';
    document.getElementById('floatingSpeak').style.display = 'none';
    
    if (foundLocation) {
        // Add marker for the found location
        const marker = L.marker([foundLocation.lat, foundLocation.lng]).addTo(map);
        
        // Create popup content
        const popupContent = `
            <b>${translations[currentLanguage].building}:</b> ${foundLocation.building}<br>
            <b>${translations[currentLanguage].floor}:</b> ${foundLocation.floor}<br>
            <b>${translations[currentLanguage].room}:</b> ${foundLocation.room}<br><br>
            <button onclick="openGoogleMapsFromPopup(${foundLocation.lat}, ${foundLocation.lng})" 
                style="padding: 10px 20px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer;">
                ${currentLanguage === 'en' ? 'Open in Maps' : 'ম্যাপে খুলুন'}
            </button>
        `;
        
        marker.bindPopup(popupContent).openPopup();
        map.setView([foundLocation.lat, foundLocation.lng], 17);
        
        // Store selected location and show buttons
        selectedLocation = foundLocation;
        document.getElementById('directionButton').style.display = 'inline-block';
        document.getElementById('floatingSpeak').style.display = 'flex';
    } else if (document.getElementById('rollNumberInput').value.length > 0) {
        // Show popup instead of alert
        showNotFoundPopup();
    }
}

// Show not found popup
function showNotFoundPopup() {
    const popup = L.popup()
        .setLatLng(map.getCenter())
        .setContent(`<div style="padding: 10px; text-align: center;">
            <p>${translations[currentLanguage].notFound}</p>
        </div>`)
        .openOn(map);
    
    // Close popup after 3 seconds
    setTimeout(() => {
        map.closePopup(popup);
    }, 3000);
}

// Open Google Maps with directions
function openGoogleMaps() {
    if (selectedLocation) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank');
    }
}

// Open Google Maps from popup
function openGoogleMapsFromPopup(lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    const icon = document.querySelector('#darkModeToggle i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Start voice search
function startVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearch');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotFoundPopup(translations[currentLanguage].voiceNotSupported);
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        voiceBtn.classList.add('listening');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.trim();
        document.getElementById('rollNumberInput').value = transcript.replace(/\D/g, '');
        findLocation();
    };
    
    recognition.onerror = function(event) {
        if (event.error === 'not-allowed') {
            showNotFoundPopup(translations[currentLanguage].permissionDenied);
        }
        voiceBtn.classList.remove('listening');
    };
    
    recognition.onend = function() {
        voiceBtn.classList.remove('listening');
    };
    
    recognition.start();
}

// Speak location details
function speakLocationDetails() {
    if (!selectedLocation || !speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
    
    if (currentLanguage === 'en') {
        utterance.text = `Your exam is in ${selectedLocation.building}, ${selectedLocation.floor}, room ${selectedLocation.room}`;
    } else {
        utterance.text = `আপনার পরীক্ষা ${selectedLocation.building}, ${selectedLocation.floor}, রুম ${selectedLocation.room}-এ`;
    }
    
    speechSynthesis.speak(utterance);
}

// Toggle language
function toggleLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    translatePage(lang);
    
    // Update active language button
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update body class for Bengali font
    document.body.classList.toggle('bengali', lang === 'bn');
}

// Translate the page
function translatePage(lang) {
    document.getElementById('mainHeading').textContent = translations[lang].title;
    document.getElementById('rollNumberInput').placeholder = translations[lang].placeholder;
    document.getElementById('findBtnText').textContent = translations[lang].findBtn;
    document.getElementById('directionBtnText').textContent = translations[lang].directionBtn;
}

// Hide preloader when everything is loaded
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 1000);
});
