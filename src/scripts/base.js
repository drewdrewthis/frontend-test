'use strict';

const max_results = 20;

function getData(search_inquiry) {
    // Search inquiry would be used to get specific results from API
    // For this challenge, only using specified query string below:
    return $.ajax({
        dataType: "json",
        url: 'https://www.deskbookers.com/nl-nl/sajax.json?q=Amsterdam&type=-&people=any&favorite=0&pid=&sw=52.293753%2C4.634942&ne=52.455562%2C5.162286&ids=17201%2C19640%2C13692%2C13691%2C12136%2C17938%2C15292%2C14886%2C14885%2C14884%2C14883%2C15730%2C15353%2C15351%2C15330%2C15080%2C17290%2C15454%2C15451%2C15379'
    });
}

function setDimensionsForResponsiveElements() {
    $('ul.results-list').css('width', window.innerWidth / 5 * $('.result-item').length + 'px');
}

var app = {
    // Initialize the app
    // This lays out the structure
    model: {
        raw_data: undefined, //All data from server
        locations: undefined, //Current result data
        location_names: undefined //Possible search results
    },
    components: {
        main_carousel: undefined, // 
        results_area: undefined
    },
    init: function() {
        // Use session storage if available
        if (sessionStorage.getItem('location_data')) {
            let dataString = sessionStorage.getItem('location_data');
            app.model.raw_data = JSON.parse(dataString);
            console.log('Using data from session storage..', app.model.raw_data);
            app.setUp();
        } else {
            $('.loader').show();
            app.setData();
            
        }
    },
    // Get and set data from the API
    setData: function() {
        $.when(getData()).then(function(data) {
            console.log('Retrieved data', data);
            sessionStorage.setItem('location_data', JSON.stringify(data));
            app.model.raw_data = data;
            app.setUp();
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
