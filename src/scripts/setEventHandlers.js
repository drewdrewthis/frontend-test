function setEventHandlers() {
    // Search form
    $('#location-search-form').submit(function(e) {
        let search_inquiry = $('input[type="text"]').val();
        e.preventDefault();
        if(search_inquiry) {
            processSearch(search_inquiry);
            $('input[type="text"]').val("");
            revealResultsArea();
        }
    });

    // Search form predictive search
    $('#location-search-form input[type="text"]').focus(function() {
        // When focus is on search input
        // Evaluate string on keyup - keydown fires before text is available
        $('#location-search-form input[type="text"]').keyup(function(e) {
            let search_inquiry = $('#location-search-form input[type="text"]').val();
            //console.log('Key Down');
            predictSearch(search_inquiry);
            $('.predictive-box').show();
            if (e.keyCode == 27) {
                // User pressed esc key
                $('.predictive-box').hide();
                $('#location-search-form input[type="text"]').val("");
            }
        })
    });

    // Hide prediction box when focus isn't on search
    $('#location-search-form input[type="text"]').focusout(function() {
        if (!$('.predictive-box').is(":hover")) {
            $('.predictive-box').hide();
        }
    });

    // Fill search bar with whatever a user selects from list
    $('.predictive-item').on('click', function() {
        $('.predictive-results').html("");
        $(this).data('name');
        $('.predictive-box').hide();
    })
}