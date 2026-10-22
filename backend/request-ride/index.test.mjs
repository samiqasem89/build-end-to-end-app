import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
    DynamoDBDocumentClient,
    PutCommand
} from '@aws-sdk/lib-dynamodb';
import { handler } from './index.mjs';

const context = {
    awsRequestId: 'test-request-id'
};

const originalEnvironment = {
    TABLE_NAME: process.env.TABLE_NAME,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN
};

let databaseMock;

function validEvent() {
    return {
        requestContext: {
            authorizer: {
                claims: {
                    'cognito:username': 'test-user'
                }
            }
        },
        isBase64Encoded: false,
        body: JSON.stringify({
            PickupLocation: {
                Latitude: 27.0442,
                Longitude: -82.2359
            }
        })
    };
}

beforeEach(() => {
    process.env.TABLE_NAME = 'TestRides';
    process.env.ALLOWED_ORIGIN = 'https://example.com';

    // Intercept database calls before they reach AWS.
    databaseMock = mock.method(
        DynamoDBDocumentClient.prototype,
        'send',
        async () => ({})
    );

    // Keep test output readable.
    mock.method(console, 'info', () => {});
    mock.method(console, 'error', () => {});
});

afterEach(() => {
    mock.restoreAll();

    for (const [name, value] of Object.entries(originalEnvironment)) {
        if (value === undefined) {
            delete process.env[name];
        } else {
            process.env[name] = value;
        }
    }
});

test('missing authentication returns 401 without a database call', async () => {
    const event = validEvent();
    delete event.requestContext.authorizer;

    const result = await handler(event, context);

    assert.equal(result.statusCode, 401);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('malformed JSON returns 400 without a database call', async () => {
    const event = validEvent();
    event.body = '{invalid-json';

    const result = await handler(event, context);

    assert.equal(result.statusCode, 400);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('missing coordinates return 400 without a database call', async () => {
    const event = validEvent();
    event.body = JSON.stringify({});

    const result = await handler(event, context);

    assert.equal(result.statusCode, 400);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('out-of-range coordinates return 400', async () => {
    const event = validEvent();
    event.body = JSON.stringify({
        PickupLocation: {
            Latitude: 91,
            Longitude: -181
        }
    });

    const result = await handler(event, context);

    assert.equal(result.statusCode, 400);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('coordinates supplied as strings return 400', async () => {
    const event = validEvent();
    event.body = JSON.stringify({
        PickupLocation: {
            Latitude: '27.0442',
            Longitude: '-82.2359'
        }
    });

    const result = await handler(event, context);

    assert.equal(result.statusCode, 400);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('valid request returns 201 and writes the correct record', async () => {
    const result = await handler(validEvent(), context);
    const body = JSON.parse(result.body);

    assert.equal(result.statusCode, 201);
    assert.equal(body.Rider, 'test-user');
    assert.match(body.RideId, /^[A-Za-z0-9_-]{22}$/);
    assert.equal(
        result.headers['Access-Control-Allow-Origin'],
        'https://example.com'
    );

    assert.equal(databaseMock.mock.callCount(), 1);

    const command = databaseMock.mock.calls[0].arguments[0];

    assert.ok(command instanceof PutCommand);
    assert.equal(command.input.TableName, 'TestRides');
    assert.equal(command.input.Item.User, 'test-user');
    assert.equal(command.input.Item.RideId, body.RideId);
    assert.deepEqual(command.input.Item.Unicorn, body.Unicorn);
    assert.ok(
        Number.isFinite(Date.parse(command.input.Item.RequestTime))
    );
});

test('base64-encoded JSON is accepted', async () => {
    const event = validEvent();
    event.body = Buffer.from(event.body).toString('base64');
    event.isBase64Encoded = true;

    const result = await handler(event, context);

    assert.equal(result.statusCode, 201);
    assert.equal(databaseMock.mock.callCount(), 1);
});

test('missing table configuration returns 500 without a write', async () => {
    delete process.env.TABLE_NAME;

    const result = await handler(validEvent(), context);

    assert.equal(result.statusCode, 500);
    assert.equal(databaseMock.mock.callCount(), 0);
});

test('database errors return a generic message', async () => {
    databaseMock.mock.mockImplementation(async () => {
        throw new Error('Sensitive internal database details');
    });

    const result = await handler(validEvent(), context);
    const body = JSON.parse(result.body);

    assert.equal(result.statusCode, 500);
    assert.equal(body.Error, 'Unable to process your ride request.');
    assert.equal(body.Reference, context.awsRequestId);
    assert.ok(!result.body.includes('Sensitive internal'));
});

test('no CORS origin is returned when none is configured', async () => {
    delete process.env.ALLOWED_ORIGIN;

    const result = await handler(validEvent(), context);

    assert.equal(result.statusCode, 201);
    assert.equal(
        result.headers['Access-Control-Allow-Origin'],
        undefined
    );
});
