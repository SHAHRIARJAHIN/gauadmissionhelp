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
        attributionControl: false
    }).setView([24.036253972589652, 90.3977985470635], 16);

    L.tileLayer(`https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`, {
        maxZoom: 20
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
    document.querySelectorAll('.language-btn').forEach(button => {
        button.addEventListener('click', () => toggleLanguage(button.dataset.lang));
    });
    
    // Find location button
    document.getElementById('findlocation').addEventListener('click', function(e) {
        e.preventDefault();
        findLocation();
    });
    
    // Directions button
    document.getElementById('directionButton').addEventListener('click', function() {
        if (selectedLocation) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank');
        }
    });
}

// Find location function
function findLocation() {
    const rollInput = document.getElementById('rollNumberInput').value;
    if (!rollInput || rollInput.length < 5) {
        showNotFoundPopup("Please enter a 5-digit roll number");
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
    document.getElementById('markerPopupContainer').classList.remove('active');
    
    if (foundLocation) {
        // Add invisible marker to map
        const marker = L.marker([foundLocation.lat, foundLocation.lng], {
            opacity: 0
        }).addTo(map);
        
        // Create popup content for our custom container
        const popupContent = `
            <h3>${translations[currentLanguage].title}</h3>
            <p><strong>${translations[currentLanguage].building}:</strong> ${foundLocation.building}</p>
            <p><strong>${translations[currentLanguage].floor}:</strong> ${foundLocation.floor}</p>
            <p><strong>${translations[currentLanguage].room}:</strong> ${foundLocation.room}</p>
            <button class="buttond" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${foundLocation.lat},${foundLocation.lng}', '_blank')">
                ${translations[currentLanguage].directionBtn}
            </button>
        `;
        
        // Insert into our custom popup container
        document.getElementById('popupContent').innerHTML = popupContent;
        document.getElementById('markerPopupContainer').classList.add('active');
        
        // Store selected location and show buttons
        selectedLocation = foundLocation;
        document.getElementById('directionButton').style.display = 'inline-block';
        document.getElementById('floatingSpeak').style.display = 'flex';
        
        // Center map on location
        map.setView([foundLocation.lat, foundLocation.lng], 17);
    } else {
        showNotFoundPopup(translations[currentLanguage].notFound);
    }
}

// Show not found popup
function showNotFoundPopup(message) {
    document.getElementById('popupContent').innerHTML = `
        <div style="text-align: center; color: var(--error-red);">
            <p>${message}</p>
        </div>
    `;
    document.getElementById('markerPopupContainer').classList.add('active');
    setTimeout(() => {
        document.getElementById('markerPopupContainer').classList.remove('active');
    }, 3000);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    const icon = document.querySelector('#darkModeToggle i');
    icon.classList.toggle('fa-moon', !isDarkMode);
    icon.classList.toggle('fa-sun', isDarkMode);
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

// Toggle language
function toggleLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    translatePage(lang);
    
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    document.body.classList.toggle('bengali', lang === 'bn');
}

// Translate page
function translatePage(lang) {
    document.getElementById('mainHeading').textContent = translations[lang].title;
    document.getElementById('rollNumberInput').placeholder = translations[lang].placeholder;
    document.getElementById('findBtnText').textContent = translations[lang].findBtn;
    document.getElementById('directionBtnText').textContent = translations[lang].directionBtn;
}

// Hide preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        map.invalidateSize();
    }, 1000);
});
