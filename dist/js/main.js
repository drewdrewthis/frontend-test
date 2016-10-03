'use strict';

var max_results = 20;

function getData(search_inquiry) {
    // Search inquiry would be used to get specific results from API
    // For this challenge, only using specified query string below:
    return $.ajax({
        dataType: "json",
        url: 'https://www.deskbookers.com/nl-nl/sajax.json?q=Amsterdam&type=-&people=any&favorite=0&pid=&sw=52.293753%2C4.634942&ne=52.455562%2C5.162286&ids=17201%2C19640%2C13692%2C13691%2C12136%2C17938%2C15292%2C14886%2C14885%2C14884%2C14883%2C15730%2C15353%2C15351%2C15330%2C15080%2C17290%2C15454%2C15451%2C15379'
    });
}

function createCarousel(element, image_arr) {

    var $carousel = $(element);
    $carousel.current_image_index = 0; // 
    $carousel.images = image_arr;

    function createControls() {
        var template = '\n            <div class="control-wrapper left">\n                <div class="control left-control">\n                    <i class="fa fa-chevron-left" aria-hidden="true"></i>\n                </div>\n            </div>\n            <div class="control-wrapper right">\n                <div class="control right-control">\n                    <i class="fa fa-chevron-right" aria-hidden="true"></i>\n                </div>\n            </div>\n        ';

        $carousel.append(template);

        $carousel.find('.right-control').on('click', function () {
            $carousel.nextImage();
        });

        $carousel.find('.left-control').on('click', function () {
            $carousel.prevImage();
        });
    }

    $carousel.goToImage = function (index) {
        $('.carousel-item').fadeOut(2000);
        $('.carousel-item[data-id="' + index + '"]').fadeIn(2000);

        if ($carousel.images.length === 0) {
            $carousel.find('.control').hide();
        }
        /*
        // Unnecessary with new looping feature
        else if ($carousel.current_image_index === 0) {
            $carousel.find('.left-control').hide();
            $carousel.find('.right-control').show();
        } else if ($carousel.current_image_index === $carousel.images.length - 1) {
            $carousel.find('.left-control').show();
            $carousel.find('.right-control').hide();
        } 
        */
        else {
                $carousel.find('.control').show();
            }
    };

    $carousel.updateSlides = function (slides, headlines) {
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

function createSearchList(locations) {
    var place_hash = {};
    // Create a list of places to search
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

    // Sort list and return
    location_names.sort(function (a, b) {
        return a.localeCompare(b);
    });
    return location_names;
}

function predictSearch(str) {
    // Predict by location name
    // Filter list by input string
    var list = app.model.location_names.filter(function (place) {
        return place.toLowerCase().includes(str.toLowerCase());
    });

    // Full predictor with only top 5 results
    fillPredictor('.predictive-results', list.slice(0, 5));
}

function fillPredictor(element, list) {
    var $predictor = $(element);
    $predictor.html("");
    $predictor.append('\n            <li data-id="" \n                class="predictive-item"\n                data-name="All">Search all locations..</li>');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var location = _step.value;

            $predictor.append('\n            <li data-id="" \n                class="predictive-item"\n                data-name="' + location + '">' + location + '</li>');
        }

        // Set handler
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
        if (name === "All") {
            $('#location-search-form input[type="text"]').val("");
            processSearch();
            revealResultsArea();
            $('.predictive-box').hide();
        } else {
            $('#location-search-form input[type="text"]').val(name);
            $('.predictive-box').hide();
        }
    });
}

function createResultsList(str) {
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

function processSearch(str) {
    // First clear results and show loader
    $('.results-list').html("");
    $('.results-section .loader').show();
    $('#location-search-form input[type="text"]').val("");
    $.when(getData(str)).then(function (data) {
        // Pretend to get new search results with new query
        // and update model
        app.model.locations = createResultsList(str);

        // Update results and reset responsive elements
        updateResults(app.model.locations);
        setDimensionsForResponsiveElements();
        // Hide loader after loading new results
        $('.results-section .loader').fadeOut();
    });
}

function updateResults(locations) {
    // Fill results div
    console.log('Update Results', locations);
    locations.map(function (location, index) {
        var location_url = location.url;
        var workplace = location.name;
        var location_name = location.location_name;
        var review_score = location.rating || "-";
        var price = location.day_price ? '$' + location.day_price + "/day" : "";
        var image_url = location.image_urls2[0]; // Use smaller thumbs

        $('.results-list').append('<li \n            id="location-' + index + '" \n            class="result-item" \n            style="background-image:url(\'' + image_url + '\'); display: none;">\n                <a href="' + (location_url || "#") + '">\n                    <ul class="location-info">\n                        <li>' + workplace + '</li>\n                        <li>' + location_name + '</li>\n                        <li>Score: ' + review_score + '</li>\n                        <li>' + price + '</li>\n                    </ul>\n                </a>\n            </li>');
        $('#location-' + index).fadeIn(1000 * index); // Creates cool progressive fade in
    });
}

function revealResultsArea() {
    // Scroll down to display results
    $('html, body').animate({
        scrollTop: $(".results-section").height()
    }, 1000);
}

function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function (e) {
        var search_inquiry = $('input[type="text"]').val();
        e.preventDefault();
        if (search_inquiry) {
            processSearch(search_inquiry);
            $('input[type="text"]').val("");
            revealResultsArea();
        }
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function () {
        // When focus is on search input
        // Evaluate string on keyup - keydown fires before text is available
        $('#location-search-form input[type="text"]').keyup(function (e) {
            var search_inquiry = $('#location-search-form input[type="text"]').val();
            //console.log('Key Down');
            predictSearch(search_inquiry);
            $('.predictive-box').show();
        });
    });

    // Hide prediction box when focus isn't on search
    $('#location-search-form input[type="text"]').focusout(function () {
        if (!$('.predictive-box').is(":hover")) {
            $('.predictive-box').hide();
        }
    });

    // Fill search bar with whatever a user selects from list
    $('.predictive-item').on('click', function () {
        $('.predictive-results').html("");
        $(this).data('name');
        $('.predictive-box').hide();
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
        main_carousel: undefined // 
    },
    init: function init() {
        // Use session storage if available
        if (sessionStorage.getItem('location_data')) {
            var dataString = sessionStorage.getItem('location_data');
            app.model.raw_data = JSON.parse(dataString);
            console.log('Data from session storate', app.model.raw_data);
            app.setUp();
        } else {
            $('.loader').show();
            app.setData();
        }
    },
    // Get and set data from the API
    setData: function setData() {
        $.when(getData()).then(function (data) {
            console.log('Retrieved data', data);
            sessionStorage.setItem('location_data', JSON.stringify(data));
            app.model.raw_data = data;
            app.setUp();
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
            console.log('Location Names', app.model.location_names);
            app.components.main_carousel = createCarousel('carousel', main_images);
            updateResults(locations);
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