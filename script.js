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
        airports: ['KVCV', 'KTEX', 'KCOS', 'KOGA', 'KFSD', 'KMWM', 'KOSH', 'CNK4', 'CYYB']
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
        airports: ['KIDP', 'KHTS', 'CNK4']
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
    'CNK4': { coords: [45.252699, -79.829915], name: 'Parry Sound Airport' },
    'KMWM': { coords: [43.9124, -95.1097], name: 'Windom Municipal Airport' },
    'KIDP': { coords: [37.1587, -95.7777], name: 'Independence Municipal Airport' },
    'KHTS': { coords: [38.3667, -82.558], name: 'Tri-State Airport' },
    'KMBS': { coords: [43.5329, -84.0796], name: 'MBS International Airport' },
    'KOSH': { coords: [43.984, -88.556], name: 'Wittman Regional Airport' },
    '01WY': { coords: [42.835, -106.307], name: 'Barnes Field' },
    'U85': { coords: [43.4919, -111.9042], name: 'Rexburg-Madison County Airport' },
    'KYKM': { coords: [46.5682, -120.543], name: 'Yakima Air Terminal' },
    'CYYB': { coords: [46.362976, -79.424633], name: 'Jack Garland Airport' },
    'KTEX': { coords: [37.953894, -107.901981], name: 'Telluride Regional Airport' },
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
        const isPlaneHere = plane.airports[plane.airports.length - 1] === airport;
        const planeText = isPlaneHere ? plane.registration : 'No aircraft';
        const marker = L.marker(coords)
            .bindPopup(`<b>${name}</b><br>ICAO: ${airport}<br>Planes: ${planeText}`)
            .addTo(map);
        markers.push(marker);
    });

    const currentAirport = plane.airports[plane.airports.length - 1];
    const { coords } = airportCoords[currentAirport];
    const airplaneIcon = L.icon({
        iconUrl: 'airplane.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    const airplaneMarker = L.marker(coords, { icon: airplaneIcon })
        .bindPopup(`<b>Current Location</b><br>${airportCoords[currentAirport].name}<br>ICAO: ${currentAirport}`)
        .addTo(map);

    airplaneIcons.push(airplaneMarker);
});

map.on('click', function () {
    resetMapView();
});


function toggleMapLayer() {
    if (map.hasLayer(satelliteLayer)) {
        map.removeLayer(satelliteLayer);
        map.addLayer(normalLayer);
    } else {
        map.removeLayer(normalLayer);
        map.addLayer(satelliteLayer);
    }
}


var MapLayerControl = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        this._toggleButton = this._createButton('Toggle Map', 'Toggle between satellite and normal map', 'leaflet-control-toggle', container, toggleMapLayer);

        return container;
    },

    _createButton: function (text, title, className, container, callback) {
        var button = L.DomUtil.create('a', className, container);
        button.innerHTML = text;
        button.href = '#';
        button.title = title;

        button.style.width = 'auto'; 
        button.style.height = '30px'; 
        button.style.lineHeight = '30px';
        button.style.padding = '0 15px'; 

        L.DomEvent.on(button, 'click', L.DomEvent.stop)
            .on(button, 'click', callback, this);

        return button;
    }
});


var mapLayerControl = new MapLayerControl();


mapLayerControl.addTo(map);


var satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
});

var normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


satelliteLayer.addTo(map);
