var map;
var marker;

function initialize() {
    let myLatLng = new google.maps.LatLng(52.305584, 4.949819);
    let myOptions = {
        zoom: 8,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }

    map = new google.maps.Map(document.getElementById('map'), myOptions);

    // Onload handler to fire off the app.
    google.maps.event.addDomListener(window, 'load', initialize);
}

function setMarker(title,lat,lng) {
	let myLatLng = new google.maps.LatLng(lat, lng);
	let marker = new google.maps.Marker({
	    position: myLatLng,
	    map: map,
	    title: title
	});

	return marker;
}

function updateMap(lat,lng) {
    var newLatLng = new google.maps.LatLng(lat, lng);
    map.setCenter(newLatLng);
};

app.components.map.map = map;
app.components.map.setMarker = setMarker;
app.components.map.update = updateMap;