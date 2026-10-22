import { randomBytes } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const fleet = [
    { Name: 'Angel', Color: 'White', Gender: 'Female' },
    { Name: 'Gil', Color: 'White', Gender: 'Male' },
    { Name: 'Rocinante', Color: 'Yellow', Gender: 'Female' },
];

export const handler = async (event, context) => {
    const requestId = context.awsRequestId;
    const username =
        event?.requestContext?.authorizer?.claims?.['cognito:username'];

    if (!username) {
        return errorResponse('Unauthorized', requestId, 401);
    }

    let requestBody;

    try {
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

    const pickupLocation = requestBody?.PickupLocation;
    const latitude = pickupLocation?.Latitude;
    const longitude = pickupLocation?.Longitude;

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

    const rideId = toUrlString(randomBytes(16));

    console.info(JSON.stringify({
        event: 'ride_request_received',
        requestId,
        rideId
    }));

    try {
        const unicorn = findUnicorn(pickupLocation);

        await recordRide(rideId, username, unicorn);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                RideId: rideId,
                Unicorn: unicorn,
                Eta: '30 seconds',
                Rider: username
            })
        };
    } catch (err) {
        console.error(JSON.stringify({
            event: 'ride_request_failed',
            requestId,
            errorType: err.name
        }));

        return errorResponse(
            'Unable to process your ride request.',
            requestId,
            500
        );
    }
};

    const rideId = toUrlString(randomBytes(16));
    console.info(JSON.stringify({
    event: 'ride_request_received',
    requestId: context.awsRequestId,
    rideId: rideId
    }));

    const username = event.requestContext.authorizer.claims['cognito:username'];
    const requestBody = JSON.parse(event.body);
    const pickupLocation = requestBody.PickupLocation;

    const unicorn = findUnicorn(pickupLocation);

    try {
        await recordRide(rideId, username, unicorn);
        return {
            statusCode: 201,
            body: JSON.stringify({
                RideId: rideId,
                Unicorn: unicorn,
                Eta: '30 seconds',
                Rider: username,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, context.awsRequestId);
    }
};

function findUnicorn(pickupLocation) {
    return fleet[Math.floor(Math.random() * fleet.length)];
}

async function recordRide(rideId, username, unicorn) {
    const params = {
        TableName: 'Rides',
        Item: {
            RideId: rideId,
            User: username,
            Unicorn: unicorn,
            RequestTime: new Date().toISOString(),
        },
    };
    await ddb.send(new PutCommand(params));
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, statusCode = 500) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId
        })
    };
}
