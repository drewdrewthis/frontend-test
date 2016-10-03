function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function(e) {
        e.preventDefault();
        // Get search query from input
        let search_inquiry = $('input[type="text"]').val();
        if(search_inquiry) {
            // If search query, process new search
            processSearch(search_inquiry);
            // Clear input
            $('input[type="text"]').val("");
            // Scroll down to reveal search area
            app.components.results_area.revealResultsArea();
        }
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function() {
        // When focus is on search input
        // Evaluate string on keyup - keydown fires before text is available
        $('#location-search-form input[type="text"]').keyup(function(e) {
            let search_inquiry = $('#location-search-form input[type="text"]').val();
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
        })
    });

    // Hide prediction box when focus isn't on search
    // AND cursor isn't over the box
    $('#location-search-form input[type="text"]').focusout(function() {
        if (!$('.predictive-box').is(":hover")) {
            $('.predictive-box').hide();
        }
    });

    // Fill search bar with whatever a user selects from list
    $('.predictive-item').on('click', function() {
        // Clear first
        $('.predictive-results').html("");
        // Get name from item clicked
        $(this).data('name');
        // Hide box
        $('.predictive-box').hide();
    })
}