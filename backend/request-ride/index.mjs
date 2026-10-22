import { randomBytes } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const fleet = [
    { Name: 'Angel', Color: 'White', Gender: 'Female' },
    { Name: 'Gil', Color: 'White', Gender: 'Male' },
    { Name: 'Rocinante', Color: 'Yellow', Gender: 'Female' }
];

export const handler = async (event, context) => {
    const requestId = context.awsRequestId;

    // API Gateway must validate the token before invoking Lambda.
    const username =
        event?.requestContext?.authorizer?.claims?.['cognito:username'];

    if (!username) {
        return errorResponse('Unauthorized', requestId, 401);
    }

    let requestBody;

    try {
        if (typeof event.body !== 'string') {
            throw new Error('Missing request body');
        }

        const body = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64').toString('utf8')
            : event.body;

        requestBody = JSON.parse(body);
    } catch {
        return errorResponse(
            'Request body must contain valid JSON.',
            requestId,
            400
        );
    }

    const latitude = requestBody?.PickupLocation?.Latitude;
    const longitude = requestBody?.PickupLocation?.Longitude;

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return errorResponse(
            'Provide numeric Latitude between -90 and 90 and Longitude between -180 and 180.',
            requestId,
            400
        );
    }

    const tableName = process.env.TABLE_NAME;

    if (!tableName) {
        console.error(JSON.stringify({
            event: 'configuration_error',
            requestId,
            setting: 'TABLE_NAME'
        }));

        return errorResponse(
            'Unable to process your ride request.',
            requestId,
            500
        );
    }

    const rideId = randomBytes(16)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    console.info(JSON.stringify({
        event: 'ride_request_received',
        requestId,
        rideId
    }));

    try {
        const unicorn = findUnicorn();

        await recordRide(tableName, rideId, username, unicorn);

        console.info(JSON.stringify({
            event: 'ride_request_completed',
            requestId,
            rideId
        }));

        return response(201, {
            RideId: rideId,
            Unicorn: unicorn,
            Eta: '30 seconds',
            Rider: username
        });
    } catch (err) {
        console.error(JSON.stringify({
            event: 'ride_request_failed',
            requestId,
            errorType: err?.name || 'UnknownError'
        }));

        return errorResponse(
            'Unable to process your ride request.',
            requestId,
            500
        );
    }
};

function findUnicorn() {
    return fleet[Math.floor(Math.random() * fleet.length)];
}

async function recordRide(tableName, rideId, username, unicorn) {
    await ddb.send(new PutCommand({
        TableName: tableName,
        Item: {
            RideId: rideId,
            User: username,
            Unicorn: unicorn,
            RequestTime: new Date().toISOString()
        }
    }));
}

function response(statusCode, body) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add browser access only when an allowed origin is configured.
    if (process.env.ALLOWED_ORIGIN) {
        headers['Access-Control-Allow-Origin'] =
            process.env.ALLOWED_ORIGIN;
    }

    return {
        statusCode,
        headers,
        body: JSON.stringify(body)
    };
}

function errorResponse(message, requestId, statusCode) {
    return response(statusCode, {
        Error: message,
        Reference: requestId
    });
}
