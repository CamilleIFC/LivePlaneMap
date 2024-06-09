const fleetData = [
    {
        registration: 'N797FM',
        type: 'Spitfire',
        color: 'Light red',
        airports: ['KVCV', 'KLSV']
    },
    {
        registration: 'N975XJ',
        type: 'Spitfire',
        color: 'Dark red',
        airports: ['KVCV']
    },
    {
        registration: 'N638OD',
        type: 'P-38',
        color: 'Purple',
        airports: ['KVCV', 'KCOS', 'KOGA', 'KFSD', 'KMWM', 'KOSH', 'CNK4', 'CYYB']
    },
    {
        registration: 'N639TF',
        type: 'C208',
        color: 'Green',
        airports: ['KIDP', 'CNK4']
    },
    {
        registration: 'N508EI',
        type: 'C208',
        color: 'Dark Green',
        airports: ['KIDP', 'KHTS']
    },
    {
        registration: 'N597CD',
        type: 'Spitfire',
        color: 'mediumvioletred',
        airports: ['KVCV', 'KCOS']
    },
    {
        registration: 'N700QH',
        type: 'C172',
        color: 'mediumspringgreen',
        airports: ['KIDP', 'KMBS', 'CNK4']
    },
    {
        registration: 'N831QP',
        type: 'XCub',
        color: 'orange',
        airports: ['KYKM', 'U85', '01WY', 'KVOK']
    }
];


const colorMap = {
    'Light red': 'lightcoral',
    'Dark red': 'darkred',
    'Purple': 'purple',
    'Green': 'limegreen',
    'Dark Green': 'darkgreen',
    'mediumvioletred': 'mediumvioletred',
    'mediumspringgreen': 'mediumspringgreen',
    'orange': 'orange'
};


const airportCoords = {
    'KVCV': { coords: [34.5975, -117.3833], name: 'Southern California Logistics Airport' },
    'KLSV': { coords: [36.2362, -115.034], name: 'Nellis Air Force Base' },
    'KCOS': { coords: [38.8058, -104.7003], name: 'City of Colorado Springs Municipal Airport' },
    'KOGA': { coords: [41.1192, -101.7694], name: 'Searle Field' },
    'KFSD': { coords: [43.582, -96.7419], name: 'Sioux Falls Regional Airport' },
    'KVOK': { coords: [43.9397, -90.2534], name: 'Volk Field' },
    'CNK4': { coords: [43.0231, -79.935], name: 'Brantford Airport' },
    'KMWM': { coords: [43.9124, -95.1097], name: 'Windom Municipal Airport' },
    'KIDP': { coords: [37.1587, -95.7777], name: 'Independence Municipal Airport' },
    'KHTS': { coords: [38.3667, -82.558], name: 'Tri-State Airport' },
    'KMBS': { coords: [43.5329, -84.0796], name: 'MBS International Airport' },
    'KOSH': { coords: [43.984, -88.556], name: 'Wittman Regional Airport' },
    '01WY': { coords: [42.835, -106.307], name: 'Barnes Field' },
    'U85': { coords: [43.4919, -111.9042], name: 'Rexburg-Madison County Airport' },
    'KYKM': { coords: [46.5682, -120.543], name: 'Yakima Air Terminal' },
    'CYYB': { coords: [46.3629, -79.4246], name: 'Jack Garland Airport' },
};

var map = L.map('map').setView([39.8283, -98.5795], 4);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



var polylines = [];
var markers = [];
var airplaneIcons = [];


function resetMapView() {
    polylines.forEach(line => map.addLayer(line));
    markers.forEach(marker => map.addLayer(marker));
    airplaneIcons.forEach(icon => map.addLayer(icon));
}


fleetData.forEach(plane => {
    const coordinates = plane.airports.map(airport => airportCoords[airport].coords);

    const polyline = L.polyline(coordinates, { color: colorMap[plane.color], weight: 5 })
        .on('click', function (e) {

            L.DomEvent.stopPropagation(e);


            polylines.forEach(line => map.removeLayer(line));

            map.addLayer(polyline);


            markers.forEach(marker => map.removeLayer(marker));
            airplaneIcons.forEach(icon => map.removeLayer(icon));


            plane.airports.forEach(airport => {
                const marker = markers.find(m => m.getLatLng().equals(airportCoords[airport].coords));
                if (marker) map.addLayer(marker);
            });

            const currentLocation = airportCoords[plane.airports[plane.airports.length - 1]];
            const airplaneIcon = airplaneIcons.find(icon => icon.getLatLng().equals(currentLocation.coords));
            if (airplaneIcon) map.addLayer(airplaneIcon);

            // Show plane details
            polyline.bindPopup(`<b>${plane.registration}</b><br>Type: ${plane.type}`).openPopup();
        })
        .addTo(map);

    polylines.push(polyline);

    plane.airports.forEach(airport => {
        const { coords, name } = airportCoords[airport];
        const marker = L.marker(coords)
            .bindPopup(`<b>${name}</b><br>ICAO: ${airport}`)
            .addTo(map);
        markers.push(marker);
    });


    const currentLocation = airportCoords[plane.airports[plane.airports.length - 1]];
    const airplaneIcon = L.icon({
        iconUrl: 'airplane.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    const airplaneMarker = L.marker(currentLocation.coords, { icon: airplaneIcon })
        .bindPopup(`<b>Current Location</b><br>${currentLocation.name}<br>ICAO: ${plane.airports[plane.airports.length - 1]}`)
        .addTo(map);

    airplaneIcons.push(airplaneMarker);
});

map.on('click', function () {
    resetMapView();
});
