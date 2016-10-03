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