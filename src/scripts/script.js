'use strict';

const max_results = 20;

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
        var template = `
			<div class="control-wrapper left">
				<div class="control left-control">
					<i class="fa fa-chevron-left" aria-hidden="true"></i>
				</div>
			</div>
			<div class="control-wrapper right">
				<div class="control right-control">
					<i class="fa fa-chevron-right" aria-hidden="true"></i>
				</div>
			</div>
		`;

        $carousel.append(template);

        $carousel.find('.right-control').on('click', function() {
            $carousel.nextImage();
        });

        $carousel.find('.left-control').on('click', function() {
            $carousel.prevImage();
        });
    }

    $carousel.goToImage = function(index) {
        $('.carousel-item').fadeOut(2000);
        $(`.carousel-item[data-id="${index}"]`).fadeIn(2000);

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
    }

    $carousel.updateSlides = function(slides, headlines) {
        $carousel.images = slides;
        $carousel.find('ul').html("");
        slides.forEach(function(url, index) {
            if (typeof url === 'string') { // Type check
                $carousel.find('ul').append(`<li 
                	id="image-${index}" 
					data-id="${index}" 
					class="carousel-item" 
					style="background-image:url('${url}')">
						<h1 class="headline">${headlines[index] || "Headline Goes Here"}</h1>
					</li>
				`);
            }
        });

        $carousel.goToImage(0);
    }

    $carousel.nextImage = function() {
        if ($carousel.images[$carousel.current_image_index + 1]) {
            $carousel.goToImage(++$carousel.current_image_index);
        }
        else {
        	// Loop
        	$carousel.goToImage(0);
        	$carousel.current_image_index = 0;
        }
    }

    $carousel.prevImage = function() {
        if ($carousel.images[$carousel.current_image_index - 1]) {
            $carousel.goToImage(--$carousel.current_image_index);
        }
        else {
        	// Loop
        	$carousel.goToImage($carousel.images.length - 1);
        	$carousel.current_image_index = $carousel.images.length - 1;
        }
    }

    createControls();
    $carousel.append('<ul></ul>');
    $carousel.updateSlides(image_arr, ["Fast, Easy, Flexible", "Book one of our spaces"]);
    setInterval(function() {
    	if(!$carousel.is(":hover")) {
    		$carousel.nextImage();
    	}
    }, 6000);
    return $carousel;
}

function predictSearch(str) {
    let locations = app.model.rows;
    locations.sort((a, b) => a.name.localeCompare(b.name));
    let results = locations.filter(function(place) {
        return place.name.toLowerCase().includes(str.toLowerCase());
    });
    fillPredictor('.predictive-results', results.slice(0, 5));
}

function fillPredictor(element, arr) {
    var $predictor = $(element);
    $predictor.html("");
    console.log(arr);
    for (let location of arr) {
        $predictor.append(`
			<li data-id="${location.location_id}" 
				class="predictive-item"
				data-name="${location.name}">${location.name}</li>`);
    }

    // Set handler
    console.log('name');
    $('.predictive-item').on('click', function(){
    	let name = $(this).data('name');
    	console.log(name);
    	$('#location-search-form input[type="text"]').val(name);
    })
}

function processSearch(str) {
    console.log(str);
    $('#location-search-form input[type="text"]').val("");

}

function updateResults(locations) {
    locations.map(function(location, index) {
        let workplace = location.name;
        let location_name = location.location_name;
        let review_score = location.rating || "-";
        let price = (location.day_price) ? '$' + location.day_price + "/day" : "";
        let image_url = location.image_urls2[0]; // Use smaller thumbs

        $('.results-list').append(`<li 
        	id="location-${index}" 
        	class="result-item" 
        	style="background-image:url('${image_url}')">
				<ul class="location-info">
					<li>${workplace}</li>
					<li>${location_name}</li>
					<li>Score: ${review_score}</li>
					<li>${price}</li>
				</ul>
			</li>`);


    });
}

function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function(e) {
        let search_inquiry = $('input[type="text"]').val();
        e.preventDefault();
        console.log(search_inquiry);
        processSearch(search_inquiry);
        $('input[type="text"]').val("");
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function() {
        $('#location-search-form input[type="text"]').keydown(function(e) {
            let search_inquiry = $('#location-search-form input[type="text"]').val();
            console.log(search_inquiry);
            predictSearch(search_inquiry);
            $('.predictive-box').show();
        })
    });

    $('#location-search-form input[type="text"]').focus(function() {
        $('#location-search-form input[type="text"]').keydown(function(e) {
            let search_inquiry = $('#location-search-form input[type="text"]').val();
            console.log(search_inquiry);
            predictSearch(search_inquiry);
            $('.predictive-box').show();
        })
    });

    $('#location-search-form input[type="text"]').focusout(function() {
        $('.predictive-box').hide();
    });

    $('.predictive-item').on('click', function() {
        $('.predictive-results').html("");
        processSearch($(this).data('name'));
        $('.predictive-box').hide();
    })
}

function setDimensionsForResponsiveElements() {
	$('ul.results-list').css('width', window.innerWidth / 5 * $('.result-item').length + 'px');
}

var app = {
	init: function() {
		if (sessionStorage.getItem('location_data')) {
			let dataString = sessionStorage.getItem('location_data')
			app.model = JSON.parse(dataString);
			app.setUp();
		}
		else {
			app.setData();
		}
	},
    setData: function() {
        $.when(getData()).then(function(data) {
            console.log('Retrieved data', data);
            sessionStorage.setItem('location_data', JSON.stringify(data));
            app.model = data;
            init();
        });
    },
    setUp: function() {
    	let data = app.model;
    	let locations = data.rows.slice(0, Math.min(max_results, data.rows.length -1) );
    	// This was initially set up to just have a carousel for one location
    	// let main_images = locations[0].image_urls.concat(locations[0].image_urls2);

    	let main_images = data.rows.reduce(function(all_images, location) {
    		return all_images.concat(location.image_urls);
    	}, []);

    	console.log(main_images[0].length);
    	app.main_carousel = createCarousel('carousel', main_images);
    	updateResults(locations);

    	setEventHandlers();
    	setDimensionsForResponsiveElements();
    }
}

$(document).ready(function() {
    app.init();
});

$(window).resize(function() {
	setDimensionsForResponsiveElements();
})