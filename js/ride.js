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
         console.log('Sending request with data:', {
            url: _config.api.invokeUrl + '/ride',
            pickupLocation: pickupLocation,
            authToken: authToken ? 'Present' : 'Missing'
        });
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
            success: function(result) {
                console.log('Success Response:', result);
                if (!result) {
                    alert('No response received from the server. Please try again.');
                    return;
                }
                completeRequest(result);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
            // Log the complete error information
                console.log('Full error details:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                });
    
                let errorMessage = '';
                
                try {
                    // Try to parse the error response
                    const errorResponse = jqXHR.responseText ? JSON.parse(jqXHR.responseText) : {};
                    errorMessage = errorResponse.message || errorResponse.Message || 
                                 errorResponse.error || 'Unknown error occurred';
                } catch (e) {
                    errorMessage = jqXHR.responseText || 'An unknown error occurred';
                }
    
                alert('Error requesting unicorn: ' + errorMessage);
            }
        });
    }


    function completeRequest(result) {
        console.log('CompleteRequest received:', result);
    
        try {
            if (!result.Unicorn) {
                throw new Error('No unicorn data in response');
            }
    
            const unicorn = result.Unicorn;
            const pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
            
            displayUpdate(`${unicorn.Name}, your ${unicorn.Color} unicorn, is on ${pronoun} way.`);
            
            animateArrival(function animateCallback() {
                displayUpdate(`${unicorn.Name} has arrived. Giddy up!`);
                WildRydes.map.unsetLocation();
                $('#request').prop('disabled', 'disabled');
                $('#request').text('Set Pickup');
            });
        } catch (error) {
            console.error('Error in completeRequest:', error);
            alert('Error processing unicorn request: ' + error.message);
        }
    }
    // Add this helper function to check configuration
function checkConfiguration() {
    console.log('Checking configuration...');
    if (!_config.api.invokeUrl) {
        console.error('API invoke URL is not configured');
        return false;
    }
    if (!authToken) {
        console.error('Auth token is not available');
        return false;
    }
    return true;
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

    function requestUnicorn(pickupLocation) {
    // First, log what we're sending
    console.log('Sending request with data:', {
        url: _config.api.invokeUrl + '/ride',
        pickupLocation: pickupLocation,
        authToken: authToken ? 'Present' : 'Missing'
    });

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
        success: function(result) {
            // Log the successful response
            console.log('Success Response:', result);
            if (!result) {
                alert('No response received from the server. Please try again.');
                return;
            }
            completeRequest(result);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            // Log the complete error information
            console.log('Full error details:', {
                status: jqXHR.status,
                statusText: jqXHR.statusText,
                responseText: jqXHR.responseText,
                textStatus: textStatus,
                errorThrown: errorThrown
            });

            let errorMessage = '';
            
            try {
                // Try to parse the error response
                const errorResponse = jqXHR.responseText ? JSON.parse(jqXHR.responseText) : {};
                errorMessage = errorResponse.message || errorResponse.Message || 
                             errorResponse.error || 'Unknown error occurred';
            } catch (e) {
                errorMessage = jqXHR.responseText || 'An unknown error occurred';
            }

            alert('Error requesting unicorn: ' + errorMessage);
        }
    });
}

function completeRequest(result) {
    // Log the incoming result to completeRequest
    console.log('CompleteRequest received:', result);

    try {
        if (!result.Unicorn) {
            throw new Error('No unicorn data in response');
        }

        const unicorn = result.Unicorn;
        const pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        
        displayUpdate(`${unicorn.Name}, your ${unicorn.Color} unicorn, is on ${pronoun} way.`);
        
        animateArrival(function animateCallback() {
            displayUpdate(`${unicorn.Name} has arrived. Giddy up!`);
            WildRydes.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    } catch (error) {
        console.error('Error in completeRequest:', error);
        alert('Error processing unicorn request: ' + error.message);
    }
}

// Add this helper function to check configuration
function checkConfiguration() {
    console.log('Checking configuration...');
    if (!_config.api.invokeUrl) {
        console.error('API invoke URL is not configured');
        return false;
    }
    if (!authToken) {
        console.error('Auth token is not available');
        return false;
    }
    return true;
}

// Modify the handleRequestClick function
function handleRequestClick(event) {
    event.preventDefault();
    if (!checkConfiguration()) {
        alert('Application is not properly configured. Please check console for details.');
        return;
    }
    const pickupLocation = WildRydes.map.selectedPoint;
    if (!pickupLocation) {
        alert('Please select a pickup location on the map.');
        return;
    }
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
