function createSearchList(locations) {
    let place_hash = {};
    // Create a list of places to search
    let location_names = locations.reduce(function(all_names, location) {
            return all_names.concat([location.name, location.location_name, location.location_city]);
        }, [])
        .filter(function(item) {
            if (!place_hash[item]) {
                place_hash[item] = true;
                return true;
            } else {
                return false;
            }
        });

    // Sort list and return
    location_names.sort((a, b) => a.localeCompare(b));
    return location_names;
}

function predictSearch(str) {
    // Predict by location name
    // Filter list by input string
    let list = app.model.location_names.filter(function(place) {
        return place.toLowerCase().includes(str.toLowerCase());
    });

    // Full predictor with only top 5 results
    fillPredictor('.predictive-results', list.slice(0, 5));
}

function fillPredictor(element, list) {
    var $predictor = $(element);
    $predictor.html("");
    $predictor.append(`
            <li data-id="" 
                class="predictive-item"
                data-name="All">Search all locations..</li>`);
    for (let location of list) {
        $predictor.append(`
            <li data-id="" 
                class="predictive-item"
                data-name="${location}">${location}</li>`);
    }

    // Set handler
    $('.predictive-item').on('click', function() {
        let name = $(this).data('name');
        if (name === "All") {
            $('#location-search-form input[type="text"]').val("");
            processSearch();
            revealResultsArea();
            $('.predictive-box').hide();
        }
        else {
            $('#location-search-form input[type="text"]').val(name);
            $('.predictive-box').hide();
        }
    })
}

function createResultsList(str) {
    let locations = app.model.raw_data.rows;
    if (!str) return locations; // If no search criteria, return whole list
    let results = locations.filter(function(location) {
        if(location.name === str || 
           location.location_name === str ||
           location.location_city === str) {
            return true;
        }
        else {
            return false;
        }
    });

    return results;
}

function processSearch(str) {
    // First clear results and show loader
    $('.results-list').html("");
    $('.results-section .loader').show();
    $('#location-search-form input[type="text"]').val("");
    
    $.when(getData(str)).then(function(data) {
        // Pretend to get new search results with new query
        // and update model
        app.model.raw_data = data;
        app.model.locations = createResultsList(str);

        // Update results and reset responsive elements
        updateResults(app.model.locations);
        setDimensionsForResponsiveElements();
        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    }).fail(function(error) {
        console.error("Could not connect to API","Using session storage..", error);
        app.model.locations = createResultsList(str);
        // Update results and reset responsive elements
        updateResults(app.model.locations);
        setDimensionsForResponsiveElements();
        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    });

}