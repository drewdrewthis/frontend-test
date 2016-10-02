'use strict';

var max_results = 20;

function getData() {
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
        var template = '\n\t\t\t<div class="control-wrapper left">\n\t\t\t\t<div class="control left-control">\n\t\t\t\t\t<i class="fa fa-chevron-left" aria-hidden="true"></i>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="control-wrapper right">\n\t\t\t\t<div class="control right-control">\n\t\t\t\t\t<i class="fa fa-chevron-right" aria-hidden="true"></i>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t';

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
                $carousel.find('ul').append('<li \n                \tid="image-' + index + '" \n\t\t\t\t\tdata-id="' + index + '" \n\t\t\t\t\tclass="carousel-item" \n\t\t\t\t\tstyle="background-image:url(\'' + url + '\')">\n\t\t\t\t\t\t<h1 class="headline">' + (headlines[index] || "Headline Goes Here") + '</h1>\n\t\t\t\t\t</li>\n\t\t\t\t');
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

function predictSearch(str) {
    var locations = app.model.rows;
    locations.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    var results = locations.filter(function (place) {
        return place.name.toLowerCase().includes(str.toLowerCase());
    });
    fillPredictor('.predictive-results', results.slice(0, 5));
}

function fillPredictor(element, arr) {
    var $predictor = $(element);
    $predictor.html("");
    console.log(arr);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var location = _step.value;

            $predictor.append('\n\t\t\t<li data-id="' + location.location_id + '" \n\t\t\t\tclass="predictive-item"\n\t\t\t\tdata-name="' + location.name + '">' + location.name + '</li>');
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

    console.log('name');
    $('.predictive-item').on('click', function () {
        var name = $(this).data('name');
        console.log(name);
        $('#location-search-form input[type="text"]').val(name);
    });
}

function processSearch(str) {
    console.log(str);
    $('#location-search-form input[type="text"]').val("");
}

function updateResults(locations) {
    locations.map(function (location, index) {
        var workplace = location.name;
        var location_name = location.location_name;
        var review_score = location.rating || "-";
        var price = location.day_price ? '$' + location.day_price + "/day" : "";
        var image_url = location.image_urls2[0]; // Use smaller thumbs

        $('.results-list').append('<li \n        \tid="location-' + index + '" \n        \tclass="result-item" \n        \tstyle="background-image:url(\'' + image_url + '\')">\n\t\t\t\t<ul class="location-info">\n\t\t\t\t\t<li>' + workplace + '</li>\n\t\t\t\t\t<li>' + location_name + '</li>\n\t\t\t\t\t<li>Score: ' + review_score + '</li>\n\t\t\t\t\t<li>' + price + '</li>\n\t\t\t\t</ul>\n\t\t\t</li>');
    });
}

function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function (e) {
        var search_inquiry = $('input[type="text"]').val();
        e.preventDefault();
        console.log(search_inquiry);
        processSearch(search_inquiry);
        $('input[type="text"]').val("");
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function () {
        $('#location-search-form input[type="text"]').keydown(function (e) {
            var search_inquiry = $('#location-search-form input[type="text"]').val();
            console.log(search_inquiry);
            predictSearch(search_inquiry);
            $('.predictive-box').show();
        });
    });

    $('#location-search-form input[type="text"]').focus(function () {
        $('#location-search-form input[type="text"]').keydown(function (e) {
            var search_inquiry = $('#location-search-form input[type="text"]').val();
            console.log(search_inquiry);
            predictSearch(search_inquiry);
            $('.predictive-box').show();
        });
    });

    $('#location-search-form input[type="text"]').focusout(function () {
        $('.predictive-box').hide();
    });

    $('.predictive-item').on('click', function () {
        $('.predictive-results').html("");
        processSearch($(this).data('name'));
        $('.predictive-box').hide();
    });
}

function setDimensionsForResponsiveElements() {
    $('ul.results-list').css('width', window.innerWidth / 5 * $('.result-item').length + 'px');
}

var app = {
    init: function init() {
        if (sessionStorage.getItem('location_data')) {
            var dataString = sessionStorage.getItem('location_data');
            app.model = JSON.parse(dataString);
            app.setUp();
        } else {
            app.setData();
        }
    },
    setData: function setData() {
        $.when(getData()).then(function (data) {
            console.log('Retrieved data', data);
            sessionStorage.setItem('location_data', JSON.stringify(data));
            app.model = data;
            init();
        });
    },
    setUp: function setUp() {
        var data = app.model;
        var locations = data.rows.slice(0, Math.min(max_results, data.rows.length - 1));
        // This was initially set up to just have a carousel for one location
        // let main_images = locations[0].image_urls.concat(locations[0].image_urls2);

        var main_images = data.rows.reduce(function (all_images, location) {
            return all_images.concat(location.image_urls);
        }, []);

        console.log(main_images[0].length);
        app.main_carousel = createCarousel('carousel', main_images);
        updateResults(locations);

        setEventHandlers();
        setDimensionsForResponsiveElements();
    }
};

$(document).ready(function () {
    app.init();
});

$(window).resize(function () {
    setDimensionsForResponsiveElements();
});