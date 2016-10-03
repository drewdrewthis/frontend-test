'use strict';

var max_results = 20; //Use this number to cap the amount of data being requested from API

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
    init: function init() {
        // Init app. Start off by getting data from API url provided
        // in ReadMe. Use this to populate results and carousel.
        // Use session storage if available
        if (sessionStorage.getItem('location_data')) {
            // Get data from session storage as string
            var dataString = sessionStorage.getItem('location_data');
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
    setData: function setData() {
        $.when(getData()).then(function (data) {
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
    setUp: function setUp() {
        // Set result data from all data
        app.model.locations = app.model.raw_data.rows;
        var locations = app.model.locations.slice(0, Math.min(max_results, app.model.locations.length - 1));

        // This was initially set up to just have a carousel for one location
        // var main_images = locations[0].image_urls.concat(locations[0].image_urls2);

        var main_images = app.model.locations.reduce(function (all_images, location) {
            return all_images.concat(location.image_urls);
        }, []);

        // Wait for the documet ready before building views
        $(document).ready(function () {
            app.model.location_names = createSearchList(app.model.raw_data.rows);
            app.components.main_carousel = createCarousel('carousel', main_images);
            app.components.results_area = createResultsArea();
            app.components.results_area.update(locations);
            $('.search-box').show();
            setEventHandlers();
            setDimensionsForResponsiveElements();
        });
    }
};

// Start process
app.init();
$(window).resize(function () {
    setDimensionsForResponsiveElements();
});
'use strict';

function createCarousel(selector, image_arr) {

    // Initialize value for carousel element with selector
    var $carousel = $(selector);
    $carousel.current_image_index = 0;
    $carousel.images = image_arr;

    function createControls() {

        // HTML template for carousel controls
        var template = '\n            <div class="control-wrapper left">\n                <div class="control left-control">\n                    <i class="fa fa-chevron-left" aria-hidden="true"></i>\n                </div>\n            </div>\n            <div class="control-wrapper right">\n                <div class="control right-control">\n                    <i class="fa fa-chevron-right" aria-hidden="true"></i>\n                </div>\n            </div>\n        ';

        // Add controls HTML to carousel
        $carousel.append(template);

        // Set event handlers for click progress slides
        $carousel.find('.right-control').on('click', function () {
            $carousel.nextImage();
        });
        $carousel.find('.left-control').on('click', function () {
            $carousel.prevImage();
        });
    }

    $carousel.goToImage = function (index) {

        // Go to new image with given index
        // Fade out all items - failsafe
        $('.carousel-item').fadeOut(2000);

        // Fade in specific slide
        $('.carousel-item[data-id="' + index + '"]').fadeIn(2000);

        // If no slides, hide useless controls
        if ($carousel.images.length === 0) {
            $carousel.find('.control').hide();
        }
        /*
        // These conditionals unnecessary with new 
        // looping feature I've implimented
        else if ($carousel.current_image_index === 0) {
            $carousel.find('.left-control').hide();
            $carousel.find('.right-control').show();
        } else if ($carousel.current_image_index === $carousel.images.length - 1) {
            $carousel.find('.left-control').show();
            $carousel.find('.right-control').hide();
        } 
        */
        else {
                // Show controls if there are images // failsafe
                $carousel.find('.control').show();
            }
    };

    $carousel.updateSlides = function (slides, headlines) {
        // Update carousel slides
        $carousel.images = slides;
        $carousel.find('ul').html("");
        slides.forEach(function (url, index) {
            if (typeof url === 'string') {
                // Type check
                $carousel.find('ul').append('<li \n                    id="image-' + index + '" \n                    data-id="' + index + '" \n                    class="carousel-item" \n                    style="background-image:url(\'' + url + '\')">\n                        <h1 class="headline">' + (headlines[index] || "Headline #" + (index + 1)) + '</h1>\n                    </li>\n                ');
            }
        });

        $carousel.goToImage(0);
    };

    $carousel.nextImage = function () {
        if ($carousel.images[$carousel.current_image_index + 1]) {
            $carousel.goToImage(++$carousel.current_image_index);
        } else {
            // Loop
            $carousel.goToImage(0);
            $carousel.current_image_index = 0;
        }
    };

    $carousel.prevImage = function () {
        if ($carousel.images[$carousel.current_image_index - 1]) {
            $carousel.goToImage(--$carousel.current_image_index);
        } else {
            // Loop
            $carousel.goToImage($carousel.images.length - 1);
            $carousel.current_image_index = $carousel.images.length - 1;
        }
    };

    createControls();
    $carousel.append('<ul></ul>');
    $carousel.updateSlides(image_arr, ["Fast, Easy, Flexible", "Book one of our spaces"]);
    setInterval(function () {
        if (!$carousel.is(":hover")) {
            $carousel.nextImage();
        }
    }, 6000);
    return $carousel;
}
'use strict';

function updateResults(locations) {
    // Fill results div
    console.log('Update Results', locations);

    // Iterate through returned results and use list to 
    // populate results section
    locations.map(function (location, index) {
        var location_url = location.url;
        var workplace = location.name;
        var location_name = location.location_name;
        var review_score = location.rating || "-";
        var day_price = location.day_price ? '€' + location.day_price + "/day" : "";
        var hour_price = location.hour_price ? '€' + location.hour_price + "/hour" : "";
        var image_url = location.image_urls2[0]; // Use smaller thumbs

        $('.results-list').append('<li \n            id="location-' + index + '" \n            class="result-item" \n            style="background-image:url(\'' + image_url + '\'); display: none;">\n                <a href="' + (location_url || "#") + '">\n                    <ul class="location-info">\n                        <li class="first-line">' + workplace + '</li>\n                        <li>' + location_name + '</li>\n                        <li>Score: ' + review_score + '</li>\n                        <li>' + day_price + '</li>\n                        <li>' + hour_price + '</li>\n                    </ul>\n                </a>\n            </li>');
        $('#location-' + index).fadeIn(1000 * index); // Creates cool progressive fade in
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
        revealResultsArea: revealResultsArea
    };
}
'use strict';

function createResultsList(str) {
    // Create a new array of locations that match search query
    // This is a helper function to simulate new search results
    // If a full API was used, we wouldn't need this function
    // as we would have "filtered" results already from API payload
    var locations = app.model.raw_data.rows;
    if (!str) return locations; // If no search criteria, return whole list
    var results = locations.filter(function (location) {
        if (location.name === str || location.location_name === str || location.location_city === str) {
            return true;
        } else {
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
    var place_hash = {};
    var location_names = locations.reduce(function (all_names, location) {
        return all_names.concat([location.name, location.location_name, location.location_city]);
    }, []).filter(function (item) {
        if (!place_hash[item]) {
            place_hash[item] = true;
            return true;
        } else {
            return false;
        }
    });

    location_names.sort(function (a, b) {
        return a.localeCompare(b);
    });

    return location_names;
}

function predictSearch(str) {
    // Filter list to only include strings that have given string
    // as a substring
    var list = app.model.location_names.filter(function (place) {
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
    $predictor.append('\n            <li data-id="" \n                class="predictive-item"\n                data-name="All">Search all locations..</li>');

    // Iterate through list creating and adding items
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var location = _step.value;

            $predictor.append('\n            <li data-id="" \n                class="predictive-item"\n                data-name="' + location + '">' + location + '</li>');
        }

        // Set handler on all newly created elements
        // Handler creates click event to move selected item's data-name
        // property value into search bar to let user manually continue search.
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    $('.predictive-item').on('click', function () {
        var name = $(this).data('name');

        // If user selects "All", just go ahead and search all
        if (name === "All") {
            processSearch();
            // Scroll down to reveal results
            app.components.results_area.revealResultsArea();
            // Now done. Hide box
            $('.predictive-box').hide();
        } else {
            // Put data-name from item into input field
            $('#location-search-form input[type="text"]').val(name);
            // Now done. Hide box
            $('.predictive-box').hide();
        }
    });
}

function processSearch(str) {
    // First clear results and show loader
    $('.results-list').html("");
    // Show loader while we wait for new results
    $('.results-section .loader').show();

    // Clear input field
    $('#location-search-form input[type="text"]').val("");

    // Initiate get and set up when for promise
    $.when(getData(str)).then(function (data) {
        // Pretend to get new search results with new query
        // and update model
        app.model.raw_data = data;

        // This line is only to simulate new search results
        app.model.locations = createResultsList(str);

        // Update results and reset responsive elements
        app.components.results_area.update(locations);app.model.locations;
        setDimensionsForResponsiveElements();

        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    }).fail(function (error) {

        // Set up fail for offline dev workflow:
        // Mostly the same as above
        console.error("Could not connect to API.", "Using session storage..", error);
        app.model.locations = createResultsList(str);
        // Update results and reset responsive elements
        app.components.results_area.update(app.model.locations);
        setDimensionsForResponsiveElements();
        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    });
}
'use strict';

function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function (e) {
        e.preventDefault();
        // Get search query from input
        var search_inquiry = $('input[type="text"]').val();
        if (search_inquiry) {
            // If search query, process new search
            processSearch(search_inquiry);
            // Clear input
            $('input[type="text"]').val("");
            // Scroll down to reveal search area
            app.components.results_area.revealResultsArea();
        }
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function () {
        // When focus is on search input
        // Evaluate string on keyup - keydown fires before text is available
        $('#location-search-form input[type="text"]').keyup(function (e) {
            var search_inquiry = $('#location-search-form input[type="text"]').val();
            // Initiate predictive search process with current input
            predictSearch(search_inquiry);
            // Show predictions
            $('.predictive-box').show();
            if (e.keyCode == 27) {
                // User pressed esc key
                // Hide box and clear input field
                $('.predictive-box').hide();
                $('#location-search-form input[type="text"]').val("");
            }
        });
    });

    // Hide prediction box when focus isn't on search
    // AND cursor isn't over the box
    $('#location-search-form input[type="text"]').focusout(function () {
        if (!$('.predictive-box').is(":hover")) {
            $('.predictive-box').hide();
        }
    });

    // Fill search bar with whatever a user selects from list
    $('.predictive-item').on('click', function () {
        // Clear first
        $('.predictive-results').html("");
        // Get name from item clicked
        $(this).data('name');
        // Hide box
        $('.predictive-box').hide();
    });
}