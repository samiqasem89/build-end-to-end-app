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
    // Verify we have all required data before making the request
        if (!_config.api.invokeUrl) {
            alert('Error: API URL is not configured');
            return;
        }
    
        if (!authToken) {
            alert('Error: You are not authenticated');
            window.location.href = '/signin.html';
            return;
        }
    
        if (!pickupLocation || !pickupLocation.latitude || !pickupLocation.longitude) {
            alert('Error: Invalid pickup location');
            return;
        }
    
        // Log the request details
        console.log('Making request to:', _config.api.invokeUrl + '/ride');
        console.log('With pickup location:', pickupLocation);
    
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: function(result) {
                console.log('Successful response:', result);
                completeRequest(result);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Request failed with status:', jqXHR.status);
                console.error('Response text:', jqXHR.responseText);
                console.error('Status:', textStatus);
                console.error('Error:', errorThrown);
    
                let errorMessage = 'Request failed: ';
    
                if (jqXHR.status === 401) {
                    errorMessage = 'Authentication error. Please sign in again.';
                    window.location.href = '/signin.html';
                } else if (jqXHR.status === 403) {
                    errorMessage = 'Authorization error. Please sign in again.';
                    window.location.href = '/signin.html';
                } else if (jqXHR.status === 404) {
                    errorMessage = 'API endpoint not found. Please check configuration.';
                } else if (jqXHR.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    try {
                        const errorResponse = JSON.parse(jqXHR.responseText);
                        errorMessage += errorResponse.message || errorResponse.Message || 'Unknown error occurred';
                    } catch (e) {
                        errorMessage += jqXHR.responseText || `${textStatus} - ${errorThrown}`;
                    }
                }
    
                alert(errorMessage);
            }
        });
    }

    function validateConfig() {
        const config = window._config;
        if (!config) {
            console.error('Configuration object is missing');
            return false;
        }
        if (!config.api) {
            console.error('API configuration is missing');
            return false;
        }
        if (!config.api.invokeUrl) {
            console.error('API invoke URL is missing');
            return false;
        }
        // Check if the URL is properly formatted
        if (!config.api.invokeUrl.startsWith('https://')) {
            console.error('API invoke URL must start with https://');
            return false;
        }
        return true;
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
