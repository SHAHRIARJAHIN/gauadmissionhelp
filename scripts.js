// Translations
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
        permissionDenied: "Microphone permission denied",
        toggleLanguage: "BN" // Text to show for toggle button when in English
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
        permissionDenied: "মাইক্রোফোন অনুমতি অস্বীকার করা হয়েছে",
        toggleLanguage: "EN" // Text to show for toggle button when in Bengali
    }
};

// App variables
let currentLanguage = 'en';
let isDarkMode = false;
let locations = [];
let selectedLocation = null;
let map;
let speechSynthesis = window.speechSynthesis;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadLocations();
    setupEventListeners();
    translatePage(currentLanguage);
});

// Map initialization
function initializeMap() {
    map = L.map('map', {
        zoomControl: false,
        preferCanvas: true
    }).setView([24.036253972589652, 90.3977985470635], 16);

    L.tileLayer(`https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
    }).addTo(map);

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    window.addEventListener('resize', function() {
        map.invalidateSize();
    });
}

// Load data from Google Sheet
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
            console.log('Locations loaded:', locations);
        })
        .catch(error => console.error('Error loading locations:', error));
}

// Set up event listeners
function setupEventListeners() {
    // Real-time search
    document.getElementById('rollNumberInput').addEventListener('input', function() {
        if (this.value.length === 5) {
            findLocation();
        }
    });
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Voice search
    document.getElementById('voiceSearch').addEventListener('click', startVoiceSearch);
    
    // Speak results
    document.getElementById('speakResults').addEventListener('click', speakLocationDetails);
    
    // Language toggle
    document.getElementById('languageToggleBtn').addEventListener('click', toggleLanguage);
    
    // Find location button
    document.getElementById('findlocation').addEventListener('click', function(e) {
        e.preventDefault();
        findLocation();
    });
    
    // Directions button
    document.getElementById('directionButton').addEventListener('click', openGoogleMaps);
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
    translatePage(currentLanguage);
    document.body.classList.toggle('bengali', currentLanguage === 'bn');
}

// Translate page
function translatePage(lang) {
    document.getElementById('mainHeading').textContent = translations[lang].title;
    document.getElementById('rollNumberInput').placeholder = translations[lang].placeholder;
    document.getElementById('findBtnText').textContent = translations[lang].findBtn;
    document.getElementById('directionBtnText').textContent = translations[lang].directionBtn;
    document.getElementById('languageToggleText').textContent = translations[lang].toggleLanguage;
}

// [Rest of your existing functions remain the same...]
// (findLocation, showNotFoundPopup, openGoogleMaps, toggleDarkMode, 
// startVoiceSearch, speakLocationDetails, etc.)

// Hide preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        map.invalidateSize();
    }, 1000);
});
