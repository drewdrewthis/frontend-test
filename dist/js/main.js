'use strict';

function getData() {
    return $.ajax({
        dataType: "json",
        url: 'https://www.deskbookers.com/nl-nl/sajax.json?q=Amsterdam&type=-&people=any&favorite=0&pid=&sw=52.293753%2C4.634942&ne=52.455562%2C5.162286&ids=17201%2C19640%2C13692%2C13691%2C12136%2C17938%2C15292%2C14886%2C14885%2C14884%2C14883%2C15730%2C15353%2C15351%2C15330%2C15080%2C17290%2C15454%2C15451%2C15379'
    });
}

var app = {
    init: function init() {
        $.when(getData()).then(function (data) {
            app.model = data;
            console.log(app.model);
            app.controller.init();
        });

        $('#location-search-form').submit(function (e) {
            var search_inquiry = $('input[type="text"]').val();
            e.preventDefault();
            console.log(search_inquiry);
            app.controller.processSearch(search_inquiry);
            $('input[type="text"]').val("");
        });

        $('#location-search-form input[type="text"]').focus(function () {
            $('#location-search-form input[type="text"]').keydown(function (e) {
                var search_inquiry = $('#location-search-form input[type="text"]').val();
                console.log(search_inquiry);
                app.controller.predictSearch(search_inquiry);
                $('.predictive-box').show();
            });
        });
    },
    view: {
        num_of_results: 5
    },
    controller: {
        init: function init() {
            var num = app.view.num_of_results;
            var locations = app.model.rows.slice(0, num); // Show 
            var main_images = locations[0].image_urls.concat(locations[0].image_urls2);
            console.log(locations);
            console.log(main_images);
            app.controller.updateResults(locations);
            app.controller.updateMainCarouselImages(main_images);
        },
        updateMainCarouselImages: function updateMainCarouselImages(images) {
            images.map(function (url, index) {
                $('.carousel').append('\n\t\t\t\t\t\t<li id="image-' + index + '" class="carousel-item" style="background-image:url(\'' + url + '\')"></li>\n\t\t\t\t\t');
            });
        },
        updateResults: function updateResults(locations) {
            locations.map(function (location, index) {
                var workplace = location.name;
                var location_name = location.location_name;
                var review_score = location.rating || "-";
                var price = location.day_price ? '$' + location.day_price + "/day" : "";
                var image_url = location.image_urls[0];

                $('.results-list').append('<li id="location-' + index + '" class="result-item" style="background-image:url(\'' + image_url + '\')">\n\t\t\t\t\t\t\t<ul class="location-info">\n\t\t\t\t\t\t\t\t<li>' + workplace + '</li>\n\t\t\t\t\t\t\t\t<li>' + location_name + '</li>\n\t\t\t\t\t\t\t\t<li>Score: ' + review_score + '</li>\n\t\t\t\t\t\t\t\t<li>' + price + '</li>\n\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t</li>');
            });
        },
        predictSearch: function predictSearch(str) {
            var locations = app.model.rows;
            locations.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            var results = locations.filter(function (place) {
                return place.name.toLowerCase().includes(str.toLowerCase());
            });
            app.controller.fillPredictor(results.slice(0, 5));
        },
        fillPredictor: function fillPredictor(arr) {
            $('.predictive-results').html("");
            console.log(arr);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var location = _step.value;

                    $('.predictive-results').append('\n        \t\t\t<li data-id="' + location.location_id + '" \n        \t\t\t\tclass="predictive-item"\n        \t\t\t\tdata-name="' + location.name + '">' + location.name + '</li>');
                }
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
                $('.predictive-results').html("");
                app.controller.processSearch($(this).data('name'));
                $('.predictive-box').hide();
            });
        },
        processSearch: function processSearch(str) {
            console.log(str);
            $('#location-search-form input[type="text"]').val("");
        }
    }
};

$(document).ready(function () {
    app.init();
});