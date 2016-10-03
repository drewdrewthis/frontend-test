'use strict';

const max_results = 20; //Use this number to cap the amount of data being requested from API

function getData(search_inquiry) {
    // Search inquiry would be used to get specific results from API
    // For this challenge, only using specified query string below:
    return $.ajax({
        dataType: "json",
        url: 'https://www.deskbookers.com/nl-nl/sajax.json?q=Amsterdam&type=-&people=any&favorite=0&pid=&sw=52.293753%2C4.634942&ne=52.455562%2C5.162286&ids=17201%2C19640%2C13692%2C13691%2C12136%2C17938%2C15292%2C14886%2C14885%2C14884%2C14883%2C15730%2C15353%2C15351%2C15330%2C15080%2C17290%2C15454%2C15451%2C15379'
    });
}

function setDimensionsForResponsiveElements() {
    // Set width of results list by figuring out 1/5 of window width 
    // then multiplying that by the number of items
    // Gives
    $('ul.results-list').css('width', $('.result-item').width() * $('.result-item').length + 'px');
}

var app = {
    // Initialize the app
    // This lays out the structure as a reference
    model: {
        raw_data: undefined, //All data from server
        locations: undefined, //Current result data
        location_names: undefined //Possible search results
    },
    components: {
        main_carousel: undefined, // 
        results_area: {
            update: undefined, // Update results area
            revealResultsArea: undefined // Scroll down to reveal results
        }
    },
    init: function() {
        // Use session storage if available
        if (sessionStorage.getItem('location_data')) {
            // Get data from session storage as string
            let dataString = sessionStorage.getItem('location_data');
            // Parse to JSON for use in app
            app.model.raw_data = JSON.parse(dataString);
            console.log('Using data from session storage..', app.model.raw_data);
            // Now that data is set, set up
            app.setUp();
        } else {
            // Show loader while waiting for api
            $('.loader').show();
            app.setData();
            
        }
    },
    // Get and set data from the API
    setData: function() {
        $.when(getData()).then(function(data) {
            console.log('Retrieved data', data);
            // Store data into sessions storage
            sessionStorage.setItem('location_data', JSON.stringify(data));
            app.model.raw_data = data;
            app.setUp();
            // Once everything is loaded, fade loader
            $('.loader').fadeOut();
        });
    },
    // Set up views
    setUp: function() {
        // Set result data from all data
        app.model.locations = app.model.raw_data.rows;
        var locations = app.model.locations.slice(0, Math.min(max_results, app.model.locations.length - 1));

        // This was initially set up to just have a carousel for one location
        // var main_images = locations[0].image_urls.concat(locations[0].image_urls2);

        var main_images = app.model.locations.reduce(function(all_images, location) {
            return all_images.concat(location.image_urls);
        }, []);

        // Wait for the documet ready before building views
        $(document).ready(function() {
            app.model.location_names = createSearchList(app.model.raw_data.rows);
            app.components.main_carousel = createCarousel('carousel', main_images);
            app.components.results_area = createResultsArea();
            app.components.results_area.update(locations);
            $('.search-box').show();
            setEventHandlers();
            setDimensionsForResponsiveElements();
        });
    }
}

// Start process
app.init();
$(window).resize(function() {
    setDimensionsForResponsiveElements();
})
