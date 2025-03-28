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

// Find location function
function findLocation() {
    const rollInput = document.getElementById('rollNumberInput').value;
    if (!rollInput || rollInput.length < 5) {
        showNotFoundPopup(translations[currentLanguage].notFound);
        return;
    }

    const rollNumber = parseInt(rollInput);
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
        // Add marker
        const marker = L.marker([foundLocation.lat, foundLocation.lng], {
            riseOnHover: true
        }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div style="text-align:center;padding:10px;">
                <b>${translations[currentLanguage].building}:</b> ${foundLocation.building}<br>
                <b>${translations[currentLanguage].floor}:</b> ${foundLocation.floor}<br>
                <b>${translations[currentLanguage].room}:</b> ${foundLocation.room}<br><br>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${foundLocation.lat},${foundLocation.lng}', '_blank')" 
                    style="padding:10px 20px;background:#4285F4;color:white;border:none;border-radius:8px;cursor:pointer;">
                    ${currentLanguage === 'en' ? 'Open in Maps' : 'ম্যাপে খুলুন'}
                </button>
            </div>
        `;
        
        // Bind popup with custom positioning
        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            autoPan: true,
            closeButton: false,
            offset: L.point(0, -500),
            maxWidth: 300
        }).openPopup();
        
        // Adjust view to show marker in upper portion while popup appears at bottom
        const center = map.getCenter();
        const newCenter = L.latLng(
            foundLocation.lat + (center.lat - foundLocation.lat) * 0.3,
            foundLocation.lng
        );
        map.setView(newCenter, 17);
        
        // Store selected location and show buttons
        selectedLocation = foundLocation;
        document.getElementById('directionButton').style.display = 'inline-block';
        document.getElementById('floatingSpeak').style.display = 'flex';
    } else {
        showNotFoundPopup(translations[currentLanguage].notFound);
    }
}

// Show not found popup
function showNotFoundPopup(message) {
    const popup = L.popup()
        .setLatLng(map.getCenter())
        .setContent(`<div style="padding:10px;text-align:center;"><p>${message}</p></div>`)
        .openOn(map);
    
    setTimeout(() => map.closePopup(popup), 3000);
}

// Open Google Maps
function openGoogleMaps() {
    if (selectedLocation) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    const icon = document.querySelector('#darkModeToggle i');
    icon.classList.toggle('fa-moon', !isDarkMode);
    icon.classList.toggle('fa-sun', isDarkMode);
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
    translatePage(currentLanguage);
    document.body.classList.toggle('bengali', currentLanguage === 'bn');
    
    // Force update the toggle button text immediately
    document.getElementById('languageToggleText').textContent = 
        currentLanguage === 'en' ? translations['en'].toggleLanguage : translations['bn'].toggleLanguage;
}

// Translate page
function translatePage(lang) {
    document.getElementById('mainHeading').textContent = translations[lang].title;
    document.getElementById('rollNumberInput').placeholder = translations[lang].placeholder;
    document.getElementById('findBtnText').textContent = translations[lang].findBtn;
    document.getElementById('directionBtnText').textContent = translations[lang].directionBtn;
    document.getElementById('languageToggleText').textContent = translations[lang].toggleLanguage;
}

// Voice search
function startVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearch');
    
    if (!('webkitSpeechRecognition' in window)) {
        showNotFoundPopup(translations[currentLanguage].voiceNotSupported);
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => voiceBtn.classList.add('listening');
    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            showNotFoundPopup(translations[currentLanguage].permissionDenied);
        }
        voiceBtn.classList.remove('listening');
    };
    recognition.onend = () => voiceBtn.classList.remove('listening');
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        document.getElementById('rollNumberInput').value = transcript.replace(/\D/g, '');
        findLocation();
    };
    
    recognition.start();
}

// Text-to-speech
function speakLocationDetails() {
    if (!selectedLocation || !speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
    
    utterance.text = currentLanguage === 'en' 
        ? `Your exam is in ${selectedLocation.building}, ${selectedLocation.floor}, room ${selectedLocation.room}`
        : `আপনার পরীক্ষা ${selectedLocation.building}, ${selectedLocation.floor}, রুম ${selectedLocation.room}-এ`;
    
    speechSynthesis.speak(utterance);
}

// Hide preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        map.invalidateSize();
    }, 1000);
});
