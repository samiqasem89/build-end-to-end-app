/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            displayGenericError('Authentication token not found. Redirecting to sign in.', '/signin.html');
        }
    }).catch(function handleTokenError(error) {
        displayGenericError('Error retrieving authentication token: ' + error, '/signin.html');
    });

    function displayGenericError(message, redirectTo) {
        alert(message);
        if (redirectTo) {
            window.location.href = redirectTo;
        }
    }

    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                handleAjaxError(jqXHR, textStatus, errorThrown, 'An error occurred when requesting your unicorn');
                // Re-enable the button and reset text if the request fails
                $('#request').prop('disabled', false).text('Request Unicorn');
            }
        });
    }

    function handleAjaxError(jqXHR, textStatus, errorThrown, friendlyMessagePrefix) {
        console.error(friendlyMessagePrefix + ': ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        var message = friendlyMessagePrefix;
        if (jqXHR.responseText) {
            // Attempt to parse JSON response for a more specific message
            try {
                var response = JSON.parse(jqXHR.responseText);
                if (response.message) {
                    message += ':\n' + response.message;
                } else {
                    message += ':\n' + jqXHR.responseText;
                }
            } catch (e) {
                message += ':\n' + jqXHR.responseText;
            }
        }
        alert(message);
    }

    function completeRequest(result) {
        var unicorn;
        var pronoun;
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            WildRydes.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        event.preventDefault();
        var requestButton = $('#request');

        // Check 1: WildRydes.map and WildRydes.map.selectedPoint must exist
        if (!WildRydes.map || !WildRydes.map.selectedPoint) {
            console.error('Error: Map or selected pickup point is not available.');
            alert('Please select a pickup location on the map first.');
            return;
        }

        var pickupLocation = WildRydes.map.selectedPoint;

        // Check 2: pickupLocation must have latitude and longitude
        if (typeof pickupLocation.latitude === 'undefined' || typeof pickupLocation.longitude === 'undefined') {
            console.error('Error: Selected pickup point does not have valid latitude or longitude.');
            alert('The selected pickup location is invalid. Please try selecting again.');
            return;
        }

        // All checks passed, proceed to disable button and request unicorn
        requestButton.prop('disabled', true).text('Requesting...');
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
