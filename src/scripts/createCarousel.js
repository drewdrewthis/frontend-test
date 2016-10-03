function createCarousel(selector, image_arr) {

    // Initialize value for carousel element with selector
    var $carousel = $(selector);
    $carousel.current_image_index = 0;
    $carousel.images = image_arr;

    function createControls() {

        // HTML template for carousel controls
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

        // Add controls HTML to carousel
        $carousel.append(template);

         // Set event handlers for click progress slides
        $carousel.find('.right-control').on('click', function() {
            $carousel.nextImage();
        });
        $carousel.find('.left-control').on('click', function() {
            $carousel.prevImage();
        });
    }

    $carousel.goToImage = function(index) {

        // Go to new image with given index
        // Fade out all items - failsafe
        $('.carousel-item').fadeOut(2000);

        // Fade in specific slide
        $(`.carousel-item[data-id="${index}"]`).fadeIn(2000);

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
    }

    $carousel.updateSlides = function(slides, headlines) {
        // Update carousel slides
        $carousel.images = slides;
        $carousel.find('ul').html("");
        slides.forEach(function(url, index) {
            if (typeof url === 'string') { // Type check
                $carousel.find('ul').append(`<li 
                    id="image-${index}" 
                    data-id="${index}" 
                    class="carousel-item" 
                    style="background-image:url('${url}')">
                        <h1 class="headline">${headlines[index] || "Headline #" + (index+1)}</h1>
                    </li>
                `);
            }
        });

        $carousel.goToImage(0);
    }

    $carousel.nextImage = function() {
        if ($carousel.images[$carousel.current_image_index + 1]) {
            $carousel.goToImage(++$carousel.current_image_index);
        } else {
            // Loop
            $carousel.goToImage(0);
            $carousel.current_image_index = 0;
        }
    }

    $carousel.prevImage = function() {
        if ($carousel.images[$carousel.current_image_index - 1]) {
            $carousel.goToImage(--$carousel.current_image_index);
        } else {
            // Loop
            $carousel.goToImage($carousel.images.length - 1);
            $carousel.current_image_index = $carousel.images.length - 1;
        }
    }

    createControls();
    $carousel.append('<ul></ul>');
    $carousel.updateSlides(image_arr, ["Fast, Easy, Flexible", "Book one of our spaces"]);
    setInterval(function() {
        if (!$carousel.is(":hover")) {
            $carousel.nextImage();
        }
    }, 6000);
    return $carousel;
}