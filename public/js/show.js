let map;
let directionsDisplay = null;
let directionsService;

// Инициализация Гугл Карты
function initializeMap() {
// Настройки карты
    let opts = {
        center: new google.maps.LatLng(53.9, 27.5667),
        zoom: 7.5,
        streetViewControl: true,
        mapTypeControl: true,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), opts);

    // Добавить кнопку «Мое местоположение»
    let myLocationDiv = document.createElement('div');
    new getMyLocation(myLocationDiv, map);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myLocationDiv);
    function getMyLocation(myLocationDiv, map) {
        let myLocationBtn = document.createElement('button');
        myLocationBtn.innerHTML = 'My Location';
        myLocationBtn.className = 'large-btn';
        myLocationBtn.style.margin = '5px';
        myLocationBtn.style.opacity = '0.95';
        myLocationBtn.style.borderRadius = '3px';
        myLocationDiv.appendChild(myLocationBtn);

        myLocationBtn.addEventListener('click', function() {
            navigator.geolocation.getCurrentPosition(function(success) {
                map.setCenter(new google.maps.LatLng(success.coords.latitude, success.coords.longitude));
                map.setZoom(12);
            });
        });
    }
}
// window.addEventListener('load', initializeMap)
// Инициализация карты Google
new Promise((res, rej) => {
    initializeMap();
    res();
})
        .then(() => {
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setPanel(document.getElementById('directionsPanel'));
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(trip.googleResp);
        });


// Добавить маршрут на карту







