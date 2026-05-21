const map = L.map('map', {
    scrollWheelZoom: false
}).setView(
    [coordinates[1], coordinates[0]],
    10
);

const map = L.map('map').setView(
    [coordinates[1], coordinates[0]],
    10
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker([coordinates[1], coordinates[0]])
    .addTo(map)
    .bindPopup(`<b>${campground.title}</b><br>${campground.location}`)
    .openPopup();
