# Application Access Controls

## Deployment Status

The backend is defined in infra/template.yaml.
AWS resources are not currently deployed.
The permissions below require live verification after deployment.

## Application Users

Amazon Cognito manages registration and sign-in.

API Gateway is configured to require a Cognito token
for POST /ride.

The OPTIONS preflight request does not require authentication.
This allows browsers to perform CORS checks.

The Lambda handler checks for the expected username claim.
This check does not independently validate the token:
token validation is API Gateway's responsibility.

## Lambda Execution Role

The role trusts the AWS Lambda service.

| Action | Permitted resource | Purpose |
|---|---|---|
| dynamodb:PutItem | The project's rides table | Create ride records |
| logs:CreateLogStream | The function's log group | Create log streams |
| logs:PutLogEvents | The function's log group | Write execution logs |

The role does not grant DynamoDB read, delete,
or table-administration permissions.

CloudFormation creates the log group, so the function
does not need logs:CreateLogGroup.

## Browser Access

ALLOWED_ORIGIN specifies the frontend origin.

CORS controls browser access to responses.
It does not replace authentication or IAM permissions.

## Logging

The handler logs request IDs, ride IDs, and event names.

It does not intentionally log:
- Authentication tokens
- Full request events
- Passwords
- Pickup coordinates

The template sets log retention to seven days.

## Planned Live Tests

- Valid Cognito token permits a ride request.
- Missing or invalid token is rejected by API Gateway.
- Lambda can write to the designated table.
- Lambda cannot write to an unrelated table.
- Lambda cannot read or delete ride records.
- CloudWatch receives logs without sensitive request data.
- Browser preflight succeeds for the configured frontend.

## Known Limitations

- Live IAM enforcement has not yet been tested.
- Application users currently have the same API access.
- MFA is not configured in the current template.
- Deployment permissions are not yet defined.
