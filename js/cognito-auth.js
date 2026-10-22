/* global jQuery, AmazonCognitoIdentity */

var WildRydes = window.WildRydes || {};

(function authenticationScope($) {
    'use strict';

    var userPool = null;
    var config = window._config;
    var cognito = config && config.cognito;

    // Always provide a promise, even without AWS configuration.
    WildRydes.authToken = Promise.resolve(null);

    function displayMessage(message) {
        var target = $('#authMessage');

        if (!target.length) {
            target = $('<p>', {
                id: 'authMessage',
                role: 'status',
                'aria-live': 'polite'
            });

            var form = $(
                '#signinForm, #registrationForm, #verifyForm'
            ).first();

            if (form.length) {
                target.insertBefore(form);
            } else {
                target.prependTo('body');
            }
        }

        target.text(message);
    }

    function setFormBusy(form, busy) {
        $(form)
            .find('button[type="submit"], input[type="submit"]')
            .prop('disabled', busy);
    }

    WildRydes.signOut = function signOut() {
        if (userPool) {
            var user = userPool.getCurrentUser();

            if (user) {
                user.signOut();
            }
        }

        WildRydes.authToken = Promise.resolve(null);
        window.location.href = 'signin.html';
    };

    var configured = Boolean(
        cognito &&
        cognito.userPoolId &&
        cognito.userPoolClientId &&
        cognito.region &&
        window.AmazonCognitoIdentity
    );

    if (configured) {
        try {
            userPool = new AmazonCognitoIdentity.CognitoUserPool({
                UserPoolId: cognito.userPoolId,
                ClientId: cognito.userPoolClientId
            });
        } catch {
            userPool = null;
        }
    }

    if (userPool) {
        WildRydes.authToken = new Promise(function resolveSession(resolve) {
            var user = userPool.getCurrentUser();

            if (!user) {
                resolve(null);
                return;
            }

            user.getSession(function sessionCallback(error, session) {
                if (error || !session || !session.isValid()) {
                    resolve(null);
                    return;
                }

                resolve(session.getIdToken().getJwtToken());
            });
        });
    }

    function createUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    function handleSignIn(event) {
        event.preventDefault();

        var form = event.currentTarget;
        var email = $('#emailInputSignin').val().trim();
        var password = $('#passwordInputSignin').val();

        if (!email || !password) {
            displayMessage('Enter your email address and password.');
            return;
        }

        setFormBusy(form, true);
        displayMessage('Signing in…');

        var details = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        createUser(email).authenticateUser(details, {
            onSuccess: function onSuccess() {
                $('#passwordInputSignin').val('');
                window.location.href = 'ride.html';
            },
            onFailure: function onFailure() {
                setFormBusy(form, false);
                displayMessage(
                    'Sign-in failed. Check your credentials and ' +
                    'make sure your email is verified.'
                );
            }
        });
    }

    function handleRegister(event) {
        event.preventDefault();

        var form = event.currentTarget;
        var email = $('#emailInputRegister').val().trim();
        var password = $('#passwordInputRegister').val();
        var confirmation = $('#password2InputRegister').val();

        if (!email || !password) {
            displayMessage('Enter your email address and password.');
            return;
        }

        if (password !== confirmation) {
            displayMessage('Passwords do not match.');
            return;
        }

        if (
            password.length < 12 ||
            !/[a-z]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9\s]/.test(password)
        ) {
            displayMessage(
                'Use at least 12 characters, including uppercase, ' +
                'lowercase, a number, and a symbol.'
            );
            return;
        }

        setFormBusy(form, true);
        displayMessage('Submitting registration…');

        var emailAttribute =
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'email',
                Value: email
            });

        userPool.signUp(
            email,
            password,
            [emailAttribute],
            null,
            function registrationCallback(error) {
                setFormBusy(form, false);

                if (error) {
                    displayMessage(
                        'Registration could not be completed. ' +
                        'Check your details or try signing in ' +
                        'if you already registered.'
                    );
                    return;
                }

                $('#passwordInputRegister').val('');
                $('#password2InputRegister').val('');
                window.location.href = 'verify.html';
            }
        );
    }

    function handleVerify(event) {
        event.preventDefault();

        var form = event.currentTarget;
        var email = $('#emailInputVerify').val().trim();
        var code = $('#codeInputVerify').val().trim();

        if (!email || !code) {
            displayMessage(
                'Enter your email address and verification code.'
            );
            return;
        }

        setFormBusy(form, true);
        displayMessage('Verifying your email…');

        createUser(email).confirmRegistration(
            code,
            false,
            function verificationCallback(error) {
                setFormBusy(form, false);

                if (error) {
                    displayMessage(
                        'Verification failed. Check your email ' +
                        'and verification code.'
                    );
                    return;
                }

                window.location.href = 'signin.html';
            }
        );
    }

    $(function onReady() {
        $('#signOut').on('click', function onSignOut(event) {
            event.preventDefault();
            WildRydes.signOut();
        });

        if (!userPool) {
            $(
                '#signinForm, #registrationForm, #verifyForm'
            ).on('submit', function preventUnconfiguredSubmit(event) {
                event.preventDefault();
            });

            $(
                '#signinForm, #registrationForm, #verifyForm'
            ).find('button, input').prop('disabled', true);

            displayMessage(
                'This project is not connected to an AWS deployment. ' +
                'Registration and sign-in are currently unavailable.'
            );

            return;
        }

        $('#signinForm').on('submit', handleSignIn);
        $('#registrationForm').on('submit', handleRegister);
        $('#verifyForm').on('submit', handleVerify);
    });
}(jQuery));
