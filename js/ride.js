/* global WildRydes, _config, jQuery */

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    'use strict';

    var authToken = null;
    var authenticated = false;
    var requestPending = false;
    var selectedLocation = null;
    var apiUrl = '';

    function displayUpdate(message) {
        $('<li>').text(message).appendTo('#updates');
    }

    function updateRequestButton() {
        var ready =
            authenticated &&
            Boolean(apiUrl) &&
            Boolean(selectedLocation) &&
            !requestPending;

        $('#request')
            .prop('disabled', !ready)
            .text(requestPending ? 'Processing…' : 'Request Unicorn');
    }

    function redirectToSignIn() {
        window.location.href = 'signin.html';
    }

    function validLocation(location) {
        return location &&
            Number.isFinite(location.latitude) &&
            Number.isFinite(location.longitude) &&
            location.latitude >= -90 &&
            location.latitude <= 90 &&
            location.longitude >= -180 &&
            location.longitude <= 180;
    }

    function requestUnicorn(location) {
        requestPending = true;
        updateRequestButton();

        $.ajax({
            method: 'POST',
            url: apiUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            dataType: 'json',
            timeout: 15000,
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: location.latitude,
                    Longitude: location.longitude
                }
            })
        })
            .done(function onSuccess(result) {
                if (
                    !result ||
                    !result.Unicorn ||
                    typeof result.Unicorn.Name !== 'string' ||
                    typeof result.Unicorn.Color !== 'string'
                ) {
                    displayUpdate(
                        'The service returned an unexpected response.'
                    );
                    return;
                }

                var unicorn = result.Unicorn;

                displayUpdate(
                    unicorn.Name + ', your ' +
                    unicorn.Color + ' unicorn, is on the way.'
                );

                // Clear this selection after an accepted request.
                selectedLocation = null;

                if (typeof WildRydes.map.unsetLocation === 'function') {
                    WildRydes.map.unsetLocation();
                }

                displayUpdate(
                    'Request accepted. Select another pickup location ' +
                    'to request another ride.'
                );
            })
            .fail(function onFailure(xhr, status) {
                if (xhr.status === 401 || xhr.status === 403) {
                    authenticated = false;
                    authToken = null;

                    displayUpdate(
                        'Your request was not authorized. Please sign in again.'
                    );

                    redirectToSignIn();
                    return;
                }

                if (xhr.status === 400) {
                    displayUpdate(
                        'The pickup location was rejected. Select a valid location.'
                    );
                    return;
                }

                if (status === 'timeout') {
                    displayUpdate(
                        'The request timed out. Its outcome is unknown; ' +
                        'retrying could create another ride.'
                    );
                    return;
                }

                displayUpdate(
                    'The request could not be confirmed. ' +
                    'A network error does not necessarily mean it failed.'
                );
            })
            .always(function onComplete() {
                requestPending = false;
                updateRequestButton();
            });
    }

    $(function onReady() {
        $('#request').prop('disabled', true);

        // Remove the old workshop token display.
        $('#authTokenModal').remove();
        $('.authToken').remove();

        var config = window._config;

        if (config && config.api && config.api.invokeUrl) {
            apiUrl = config.api.invokeUrl.replace(/\/+$/, '');
        }

        if (!apiUrl) {
            displayUpdate(
                'This project is not connected to a deployed API.'
            );
            return;
        }

        if (
            !WildRydes.authToken ||
            typeof WildRydes.authToken.then !== 'function'
        ) {
            displayUpdate(
                'Authentication is not configured. ' +
                'The project is currently available for documentation only.'
            );
            return;
        }

        $(WildRydes.map).on('pickupChange', function onPickupChange() {
            if (requestPending) {
                return;
            }

            var location = WildRydes.map.selectedPoint;

            selectedLocation = validLocation(location)
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
                : null;

            updateRequestButton();
        });

        $('#request').on('click', function onRequestClick(event) {
            event.preventDefault();

            if (
                !authenticated ||
                !apiUrl ||
                !selectedLocation ||
                requestPending
            ) {
                return;
            }

            requestUnicorn(selectedLocation);
        });

        WildRydes.authToken
            .then(function onAuthenticated(token) {
                if (!token) {
                    redirectToSignIn();
                    return;
                }

                authToken = token;
                authenticated = true;

                displayUpdate(
                    'You are signed in. Select a pickup location to request a ride.'
                );

                updateRequestButton();
            })
            .catch(function onAuthenticationFailure() {
                authenticated = false;
                authToken = null;
                updateRequestButton();

                displayUpdate(
                    'Your session could not be verified. Please sign in again.'
                );

                redirectToSignIn();
            });
    });
}(jQuery));
