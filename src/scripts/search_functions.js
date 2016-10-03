function createResultsList(str) {
    // Create a new array of locations that match search query
    // This is a helper function to simulate new search results
    // If a full API was used, we wouldn't need this function
    // as we would have "filtered" results already from API payload
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

function createSearchList(locations) {
    // Takes an array of locations
    // 1. Reduce to new list just of location names of various type
    // 2. Remove all duplicates
    // 3. Sort
    // 4. Return list
    let place_hash = {};
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

    location_names.sort((a, b) => a.localeCompare(b));

    return location_names;
}

function predictSearch(str) {
    // Filter list to only include strings that have given string
    // as a substring
    let list = app.model.location_names.filter(function(place) {
        // There is probably a better way to do this with a trie
        return place.toLowerCase().includes(str.toLowerCase());
    });

    // User new list to fill prediction box 
    // with given selector
    fillPredictorBox('.predictive-results', list);
}

function fillPredictorBox(selector, list) {
    // Use list to fill element with list items

    // Set variable for element with selector
    var $predictor = $(selector);

    // Clear element
    $predictor.html("");

    // Add first item for all results
    $predictor.append(`
            <li data-id="" 
                class="predictive-item"
                data-name="All">Search all locations..</li>`);

    // Iterate through list creating and adding items
    for (let location of list) {
        $predictor.append(`
            <li data-id="" 
                class="predictive-item"
                data-name="${location}">${location}</li>`);
    }

    // Set handler on all newly created elements
    // Handler creates click event to move selected item's data-name
    // property value into search bar to let user manually continue search.
    $('.predictive-item').on('click', function() {
        let name = $(this).data('name');

        // If user selects "All", just go ahead and search all
        if (name === "All") {
            processSearch();
            // Scroll down to reveal results
            app.components.results_area.revealResultsArea();
            // Now done. Hide box
            $('.predictive-box').hide();
        }
        else {
            // Put data-name from item into input field
            $('#location-search-form input[type="text"]').val(name);
            // Now done. Hide box
            $('.predictive-box').hide();
        }
    })
}

function processSearch(str) {
    // First clear results and show loader
    $('.results-list').html("");
    // Show loader while we wait for new results
    $('.results-section .loader').show();

    // Clear input field
    $('#location-search-form input[type="text"]').val("");
    
    // Initiate get and set up when for promise
    $.when(getData(str)).then(function(data) {
        // Pretend to get new search results with new query
        // and update model
        app.model.raw_data = data;

        // This line is only to simulate new search results
        app.model.locations = createResultsList(str);

        // Update results and reset responsive elements
        app.components.results_area.update(locations);(app.model.locations);
        setDimensionsForResponsiveElements();

        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();

    }).fail(function(error) {

        // Set up fail for offline dev workflow:
        // Mostly the same as above
        console.error("Could not connect to API.","Using session storage..", error);
        app.model.locations = createResultsList(str);
        // Update results and reset responsive elements
        app.components.results_area.update(app.model.locations);
        setDimensionsForResponsiveElements();
        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    });

}