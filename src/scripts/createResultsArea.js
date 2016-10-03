function updateResults(locations) {
    // Fill results div
    console.log('Update Results', locations);
    locations.map(function(location, index) {
        let location_url = location.url;
        let workplace = location.name;
        let location_name = location.location_name;
        let review_score = location.rating || "-";
        let day_price = (location.day_price) ? '€' + location.day_price + "/day" : "";
        let hour_price = (location.hour_price) ? '€' + location.hour_price + "/hour" : "";
        let image_url = location.image_urls2[0]; // Use smaller thumbs

        $('.results-list').append(`<li 
            id="location-${index}" 
            class="result-item" 
            style="background-image:url('${image_url}'); display: none;">
                <a href="${location_url || "#"}">
                    <ul class="location-info">
                        <li class="first-line">${workplace}</li>
                        <li>${location_name}</li>
                        <li>Score: ${review_score}</li>
                        <li>${day_price}</li>
                        <li>${hour_price}</li>
                    </ul>
                </a>
            </li>`);
        $('#location-'+index).fadeIn(1000 * index); // Creates cool progressive fade in
    });
}

function revealResultsArea() {
    // Scroll down to display results
    $('html, body').animate({
        scrollTop: $(".results-section").height()
     }, 1000);
}

function createResultsArea() {
    return {
        update: updateResults,
        scrollTo: revealResultsArea
    }
}