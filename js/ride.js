/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
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
               requestIdleCallback(() => {
                    console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occurred when requesting your unicorn:\n' + jqXHR.responseText);
                });
            }
        });
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
    // Modify the initialization code
    $(function onDocReady() {
        // Critical immediate operations
        const criticalInit = () => {
            $('#request').click(handleRequestClick);
            $(WildRydes.map).on('pickupChange', handlePickupChanged);
        };

        // Non-critical operations
        const nonCriticalInit = () => {
            WildRydes.authToken.then(function updateAuthMessage(token) {
                if (token) {
                    displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                    $('.authToken').text(token);
                }
            });

            if (!_config.api.invokeUrl) {
                $('#noApiMessage').show();
            }
        };

        // Execute critical operations immediately
        criticalInit();

        // Defer non-critical operations
        requestIdleCallback ? 
            requestIdleCallback(nonCriticalInit) : 
            setTimeout(nonCriticalInit, 0);
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        event.preventDefault();
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
    var dest = WildRydes.map.selectedPoint;
    var origin = {};
    
    // Move calculations outside of animation loop
    function prepareAnimationData() {
        // Calculate origin point
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
        
        return {
            origin: origin,
            destination: dest
        };
    }

    // Prepare the data before starting animation
    const animationData = prepareAnimationData();
    
    // Use prepared data in animation
    WildRydes.map.animate(
        animationData.origin, 
        animationData.destination, 
        callback
    );
}

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
