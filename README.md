Here's a basic documentation template for your BSMRAU Admission Seat Locator project. You can expand on it as needed, depending on the level of detail you want to provide:


---

BSMRAU Admission Seat Locator Web App

Overview

The BSMRAU Admission Seat Locator Web App helps students of Bangabandhu Sheikh Mujibur Rahman Agricultural University (BSMRAU) easily locate their exam halls. By entering their roll number, students are shown a map pinpointing the exact location of their assigned exam hall, room number, and building.

This web app uses Leaflet.js for the map functionality, Google Maps for tile layers, and a Google Sheets as the database to store and retrieve building and seat information.

Features

Search for exam hall by roll number.

Displays the building, floor, and room based on roll number range.

Google Maps integration for directions from current location.

Google Sheets as the database backend.

Responsive design for mobile and desktop.

Preloader animation using a custom logo.

Support for dynamic links to external resources like Facebook profiles and maps.

Social media sharing optimized with meta tags.

Integrated with Google Adsense for ad revenue.


Technologies Used

HTML5, CSS3, JavaScript

Leaflet.js: A lightweight open-source JavaScript library for embedding interactive maps.

Google Maps API: For providing maps and directions.

Google Sheets: Used as a backend database to store seat and location data.

Fetch API: To retrieve data from the Google Sheets CSV.

Preloader Animation: Using CSS3.

Meta Tags: For social media integration (Open Graph, Twitter Cards).

Google Adsense: For monetization.


Setup and Installation

1. Download or Clone the Project:

Clone this repository to your local machine:

git clone https://github.com/YOUR-REPOSITORY



2. Configure Google Sheets:

Ensure your seat data is stored in a Google Sheet with the following columns:

Building, Floor, Room, RollFrom, RollTo, Latitude, Longitude

Publish your Google Sheet as a CSV file and update the link in the JavaScript code.



3. Add Google Maps API Key:

Replace the placeholder YOUR_GOOGLE_MAPS_API_KEY in the JavaScript file with your actual Google Maps API key.



4. Preloader Image:

Ensure the image bsmrauits.png is correctly linked and placed in the /images/ folder.



5. Host the Web App:

You can host this project on any web hosting service. For example:

GitHub Pages: Ideal for free static hosting.

Google Sites: If you prefer integration with Google's ecosystem.





Google Sheets Integration

Sheet URL: The web app fetches data from a Google Sheet using the following URL format:

https://docs.google.com/spreadsheets/d/e/YOUR-SHEET-ID/pub?gid=0&single=true&output=csv

JavaScript Fetch: The app uses the Fetch API to load CSV data, which is parsed and used to populate the map and roll number range.


Functionality Breakdown

Roll Number Search

Users can input their roll number into an HTML form.

Upon clicking "Locate your hall," the app searches through the Google Sheets data and matches the roll number with the appropriate building, room, and coordinates.

The map automatically pans to the location of the exam hall and shows the details in a popup.


Google Maps Redirection

After locating the exam hall, a "Get Directions" button appears. Clicking this button redirects users to Google Maps, showing directions from their current location to the exam hall.


Preloader Animation

A preloader animation with the BSMRAU IT Society logo (bsmrauits.png) is shown while the web page is loading. The logo performs a horizontal flip animation using CSS3 keyframes.


Usage

1. Search for Your Exam Hall:

Enter your roll number into the input field.

Click "Locate your hall."

The map will display a marker pointing to your assigned hall.

Click on the marker to view details like room and floor number.

Click "Get Directions" to open Google Maps for navigation.



2. Sharing on Social Media:

The page includes meta tags for sharing on social media with the correct image and link preview. When shared on platforms like Facebook or Twitter, users will see a preview image and a description linking to the app.



3. Statistics Tracking:

The app supports visitor tracking via analytics tools like Google Analytics, allowing you to monitor how many users visit, their device type, browser, and more.




Meta Tags for SEO and Social Sharing

Include the following meta tags in the head section of the HTML to improve discoverability and social media sharing:

<!-- SEO Meta Tags -->
<meta name="description" content="Find your BSMRAU admission exam hall location using your roll number.">
<meta name="keywords" content="BSMRAU, admission, exam hall, roll number, university, exam, hall location">
<meta name="author" content="BSMRAU IT Society">

<!-- Open Graph Meta Tags for Facebook, LinkedIn -->
<meta property="og:title" content="BSMRAU Admission Exam Hall Locator">
<meta property="og:description" content="Locate your BSMRAU admission exam hall using your roll number.">
<meta property="og:image" content="https://yourwebsite.com/images/bsmrauits.png">
<meta property="og:url" content="https://yourwebsite.com/">
<meta property="og:type" content="website">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BSMRAU Admission Exam Hall Locator">
<meta name="twitter:description" content="Find your BSMRAU admission exam hall using your roll number.">
<meta name="twitter:image" content="https://yourwebsite.com/images/bsmrauits.png">

Ad Monetization

To monetize the website with Google Adsense, follow these steps:

1. Sign up for Google Adsense and get your ad code.


2. Insert the ad code at appropriate places in your HTML where you want the ads to appear (header, footer, sidebar, etc.).



Future Improvements

User Registration: Track user roll numbers and save the information to a Google Sheet for future improvements.

Mobile App: Convert the web app into a Progressive Web App (PWA) for offline use and better performance on mobile devices.

Analytics Dashboard: Add a real-time analytics dashboard to monitor site visits, roll number searches, and navigation clicks.



---

Contact

For any queries or support, please contact:

Developer: Shahriar Morshed Jahin

Email: shahriarjahin@gmail.com



---

