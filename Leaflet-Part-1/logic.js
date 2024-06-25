// Initialize the map
var map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch earthquake data from USGS
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
fetch(url)
    .then(response => response.json())
    .then(data => {
        // Function to determine marker color based on depth
        function getColor(depth) {
            return depth > 90 ? '#d73027' :
                   depth > 70 ? '#fc8d59' :
                   depth > 50 ? '#fee08b' :
                   depth > 30 ? '#d9ef8b' :
                   depth > 10 ? '#91cf60' :
                                '#1a9850';
        }

        // Function to determine marker size based on magnitude
        function getSize(magnitude) {
            return magnitude * 4;
        }

        // Process each earthquake feature
        data.features.forEach(feature => {
            var coordinates = feature.geometry.coordinates;
            var properties = feature.properties;
            var lat = coordinates[1];
            var lon = coordinates[0];
            var depth = coordinates[2];
            var magnitude = properties.mag;

            // Create a circle marker
            L.circleMarker([lat, lon], {
                radius: getSize(magnitude),
                fillColor: getColor(depth),
                color: '#000',
                weight: 1,
                fillOpacity: 0.8
            }).bindPopup(`<strong>Location:</strong> ${properties.place}<br>
                          <strong>Magnitude:</strong> ${magnitude}<br>
                          <strong>Depth:</strong> ${depth} km`).addTo(map);
        });

        // Add a legend to the map
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [0, 10, 30, 50, 70, 90];
            var labels = [];
            var from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching earthquake data:', error));
