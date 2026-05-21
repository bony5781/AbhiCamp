const map = L.map('cluster-map', {
    scrollWheelZoom: false
}).setView([22.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

campgrounds.features.forEach(camp => {
    const coords = camp.geometry.coordinates;

    L.marker([coords[1], coords[0]])
        .addTo(map)
        .bindPopup(camp.properties.popUpMarkup);
});
