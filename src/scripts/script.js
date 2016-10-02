'use strict';

function getData() {
    return $.ajax({
        dataType: "json",
        url: 'https://www.deskbookers.com/nl-nl/sajax.json?q=Amsterdam&type=-&people=any&favorite=0&pid=&sw=52.293753%2C4.634942&ne=52.455562%2C5.162286&ids=17201%2C19640%2C13692%2C13691%2C12136%2C17938%2C15292%2C14886%2C14885%2C14884%2C14883%2C15730%2C15353%2C15351%2C15330%2C15080%2C17290%2C15454%2C15451%2C15379'
    });
}

var app = {
    init: function() {
        $.when(getData()).then(function(data) {
            app.model = data;
            console.log(app.model);
            app.controller.init();
        });

        $('#location-search-form').submit(function(e) {
            let search_inquiry = $('input[type="text"]').val();
            e.preventDefault();
            console.log(search_inquiry);
            app.controller.processSearch(search_inquiry);
            $('input[type="text"]').val("");
        })

        $('#location-search-form input[type="text"]').focus(function() {
        	$('#location-search-form input[type="text"]').keydown(function(e) {
        		let search_inquiry = $('#location-search-form input[type="text"]').val();
        		 console.log(search_inquiry);
        		app.controller.predictSearch(search_inquiry);
        		$('.predictive-box').show();
        	})
        })
    },
    view: {
        num_of_results: 5
    },
    controller: {
        init: function() {
            let num = app.view.num_of_results;
            let locations = app.model.rows.slice(0, num); // Show 
            let main_images = locations[0].image_urls.concat(locations[0].image_urls2);
            console.log(locations);
            console.log(main_images);
            app.controller.updateResults(locations);
            app.controller.updateMainCarouselImages(main_images);
        },
        updateMainCarouselImages: function(images) {
            images.map(function(url, index) {
                $('.carousel').append(`
						<li id="image-${index}" class="carousel-item" style="background-image:url('${url}')"></li>
					`);
            });
        },
        updateResults: function(locations) {
            locations.map(function(location, index) {
                let workplace = location.name;
                let location_name = location.location_name;
                let review_score = location.rating || "-";
                let price = (location.day_price) ? '$' + location.day_price + "/day" : "";
                let image_url = location.image_urls[0];

                $('.results-list').append(`<li id="location-${index}" class="result-item" style="background-image:url('${image_url}')">
							<ul class="location-info">
								<li>${workplace}</li>
								<li>${location_name}</li>
								<li>Score: ${review_score}</li>
								<li>${price}</li>
							</ul>
						</li>`);
            });
        },
        predictSearch: function(str) {
        	let locations = app.model.rows;
        	locations.sort((a,b) => a.name.localeCompare(b.name));
        	let results = locations.filter(function(place) {
        		return place.name.toLowerCase().includes(str.toLowerCase());
        	});
        	app.controller.fillPredictor(results.slice(0,5));

        },
        fillPredictor: function(arr) {
        	$('.predictive-results').html("");
        	console.log(arr);
        	for(let location of arr) {
        		$('.predictive-results').append(`
        			<li data-id="${location.location_id}" 
        				class="predictive-item"
        				data-name="${location.name}">${location.name}</li>`
        			);
        	}
        	$('.predictive-item').on('click', function() {
        		$('.predictive-results').html("");
        		app.controller.processSearch($(this).data('name'));
        		$('.predictive-box').hide();
        	})
        	
        },
        processSearch: function(str) {
        	console.log(str);
        	$('#location-search-form input[type="text"]').val("");
        }
    }
}

$(document).ready(function() {
    app.init();
});
