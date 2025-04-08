// Translations
const translations = {
    en: {
        title: "Find Your Exam Room Location",
        placeholder: "Enter Roll Number",
        notFound: "Roll number not found in the database.",
        building: "Building",
        floor: "Floor",
        room: "Room",
        listenPrompt: "Speak your roll number now",
        voiceNotSupported: "Voice search is not supported in your browser",
        permissionDenied: "Microphone permission denied",
        toggleLanguage: "BN",
        directions: "Get Directions"
    },
    bn: {
        title: "আপনার পরীক্ষার রুমের অবস্থান খুঁজুন",
        placeholder: "রোল নম্বর লিখুন",
        notFound: "ডাটাবেসে রোল নম্বর পাওয়া যায়নি।",
        building: "ভবন",
        floor: "তলা",
        room: "রুম",
        listenPrompt: "এখন আপনার রোল নম্বর বলুন",
        voiceNotSupported: "আপনার ব্রাউজারে ভয়েস অনুসন্ধান সমর্থিত নয়",
        permissionDenied: "মাইক্রোফোন অনুমতি অস্বীকার করা হয়েছে",
        toggleLanguage: "EN",
        directions: "দিকনির্দেশনা পান"
    }
};

let currentLanguage = 'en';
let isDarkMode = false;
let locations = [];
let selectedLocation = null;
let map;
let speechSynthesis = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadLocations();
    setupEventListeners();
    translatePage(currentLanguage);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed: ', err));
    }
});

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

function loadLocations() {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRGZRQwGFGreFui52zuNH5OYHHtVuF0heys-XjDuZy2Jrg43p0PXUjcoglfTApM0olqZ2_GxWAXxy8s/pub?gid=0&single=true&output=csv';
    
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

function setupEventListeners() {
    document.getElementById('rollNumberInput').addEventListener('input', function() {
        if (this.value.length === 5) {
            findLocation();
        }
    });
    
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('voiceSearch').addEventListener('click', startVoiceSearch);
    document.getElementById('speakResults').addEventListener('click', speakLocationDetails);
    document.getElementById('languageToggleBtn').addEventListener('click', toggleLanguage);
    document.getElementById('expandSearch').addEventListener('click', function() {
        document.querySelector('.search-container').classList.remove('collapsed');
        this.style.display = 'none';
    });
}

function findLocation() {
    const rollInput = document.getElementById('rollNumberInput').value;
    if (!rollInput || rollInput.length < 5) {
        showNotFoundPopup(translations[currentLanguage].notFound);
        return;
    }

    if (window.innerWidth <= 768) {
        document.querySelector('.search-container').classList.add('collapsed');
        document.getElementById('expandSearch').style.display = 'flex';
    }

    const rollNumber = parseInt(rollInput);
    const foundLocation = locations.find(loc => rollNumber >= loc.rollFrom && rollNumber <= loc.rollTo);
    
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    document.getElementById('floatingSpeak').style.display = 'none';
    
    if (foundLocation) {
        const marker = L.marker([foundLocation.lat, foundLocation.lng], {
            riseOnHover: true
        }).addTo(map);
        
        const popupContent = `
            <div style="text-align:center;padding:10px;min-width:250px">
                <div style="margin-bottom:10px;">
                    <b>${translations[currentLanguage].building}:</b> ${foundLocation.building}<br>
                    <b>${translations[currentLanguage].floor}:</b> ${foundLocation.floor}<br>
                    <b>${translations[currentLanguage].room}:</b> ${foundLocation.room}
                </div>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${foundLocation.lat},${foundLocation.lng}', '_blank')" 
                    style="padding:10px 20px;background:#4285F4;color:white;border:none;border-radius:8px;cursor:pointer;width:100%">
                    ${translations[currentLanguage].directions}
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            autoPan: true,
            closeButton: false,
            offset: L.point(0, -1),
            maxWidth: 350
        }).openPopup();
        
        const center = map.getCenter();
        const newCenter = L.latLng(
            foundLocation.lat + (center.lat - foundLocation.lat) * 0.15,
            foundLocation.lng
        );
        map.setView(newCenter, 17, { animate: true });
        
        selectedLocation = foundLocation;
        document.getElementById('floatingSpeak').style.display = 'flex';
    } else {
        showNotFoundPopup(translations[currentLanguage].notFound);
    }
}

function showNotFoundPopup(message) {
    const popup = L.popup()
        .setLatLng(map.getCenter())
        .setContent(`<div style="padding:10px;text-align:center;"><p>${message}</p></div>`)
        .openOn(map);
    
    setTimeout(() => map.closePopup(popup), 3000);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    const icon = document.querySelector('#darkModeToggle i');
    icon.classList.toggle('fa-moon', !isDarkMode);
    icon.classList.toggle('fa-sun', isDarkMode);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
    translatePage(currentLanguage);
    document.body.classList.toggle('bengali', currentLanguage === 'bn');
}

function translatePage(lang) {
    document.getElementById('mainHeading').textContent = translations[lang].title;
    document.getElementById('rollNumberInput').placeholder = translations[lang].placeholder;
    document.getElementById('languageToggleText').textContent = translations[lang].toggleLanguage;
}

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

function speakLocationDetails() {
    if (!selectedLocation || !speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
    
    utterance.text = currentLanguage === 'en' 
        ? `Your exam is in ${selectedLocation.building}, ${selectedLocation.floor}, room ${selectedLocation.room}`
        : `আপনার পরীক্ষা ${selectedLocation.building}, ${selectedLocation.floor}, রুম ${selectedLocation.room}-এ`;
    
    speechSynthesis.speak(utterance);
}

window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        map.invalidateSize();
    }, 1000);
});
