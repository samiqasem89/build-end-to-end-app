# AWS Serverless Application Security Lab

[![Validate Application](https://github.com/samiqasem89/build-end-to-end-app/actions/workflows/validate.yml/badge.svg)](https://github.com/samiqasem89/build-end-to-end-app/actions/workflows/validate.yml)

An educational AWS serverless application demonstrating authentication,
IAM permissions, request validation, Infrastructure as Code, and
automated testing.

I originally implemented the application using Amplify, Cognito,
API Gateway, Lambda, and DynamoDB. I later improved the code,
access-control configuration, error handling, and verification workflow.

## Current Status

**The AWS resources are not currently deployed.**

The current repository includes:

- Frontend application code.
- A Node.js Lambda handler.
- An AWS SAM backend infrastructure template.
- 10 backend unit tests using mocked DynamoDB calls.
- 5 Chromium browser tests for inactive frontend behavior.
- GitHub Actions checks for syntax, tests, infrastructure, and packaging.

Registration, sign-in, and ride requests are intentionally disabled
when AWS configuration is empty.

The screenshots below document the original deployment. They do not
verify the current revision.

## Architecture

The intended deployed request flow is:

1. Amplify hosts the frontend.
2. Cognito handles registration and sign-in.
3. API Gateway validates the Cognito token.
4. Lambda validates the ride-request payload.
5. Lambda writes a ride record to DynamoDB.
6. CloudWatch receives limited execution logs.

The SAM template defines the backend resources. Amplify frontend
hosting is configured separately.

### Original architecture diagram

![Original AWS application architecture](https://github.com/user-attachments/assets/93f22bf9-5872-454a-8fa4-de81816c8614)

## Improvements in the Current Revision

| Area | Improvement |
|---|---|
| Backend organization | Moved Lambda code into a dedicated source file |
| Input validation | Rejects malformed JSON and invalid coordinates |
| Error handling | Returns controlled errors without exposing database details |
| Logging | Removed full-request and pickup-coordinate logging |
| Frontend security | Removed authentication-token display |
| Request handling | Prevents requests before readiness and duplicate in-flight submissions |
| Authentication interface | Handles missing configuration and connects sign-out |
| DOM updates | Uses text insertion for ordinary status messages |
| Infrastructure | Defines the backend through AWS SAM |
| IAM | Restricts database writes to the project's table |
| Log permissions | Restricts writes to the function's log group |
| Log retention | Sets retention to seven days |
| Dependencies | Uses committed lockfiles and npm ci |
| Verification | Runs backend tests, browser tests, template validation, and packaging |

These improvements are implemented in source code and configuration.
Live enforcement in AWS remains unverified for this revision.

## Original Deployment Screenshots

These diagrams and screenshots are retained from my original
implementation. Console layouts, resource identifiers, and code shown
may differ from the current source.

<details>
<summary><strong>Amplify hosting and GitHub integration</strong></summary>

The original frontend was hosted using Amplify with GitHub integration.

![Amplify architecture diagram](https://github.com/user-attachments/assets/4cce19c3-7e80-42c2-be15-319baf88f404)

![Amplify repository deployment options](https://github.com/user-attachments/assets/449c4743-f30a-4352-8141-ceef14c4e7f0)

![Amplify hosting options](https://github.com/user-attachments/assets/f0e7d629-ac08-4bb9-8b61-7737e8f12961)

![Connecting the GitHub repository to Amplify](https://github.com/user-attachments/assets/a2b6f683-056c-41e4-b938-79306ff8ef2f)

![Original Amplify application setup](https://github.com/user-attachments/assets/55b2743d-e4cc-467d-b00e-1c0b23b1b614)

</details>

<details>
<summary><strong>Cognito authentication</strong></summary>

Cognito provided application-user registration and sign-in.

![Cognito integration diagram](https://github.com/user-attachments/assets/bb6da760-8967-4e01-a318-2ee5364dd05f)

![Original frontend Cognito configuration](https://github.com/user-attachments/assets/06b6ddf4-9211-4a67-ba9a-0967ffc40f9a)

</details>

<details>
<summary><strong>DynamoDB storage</strong></summary>

The application stored ride records in a table using RideId
as the partition key.

![DynamoDB integration diagram](https://github.com/user-attachments/assets/576a77bf-ee6e-45e8-b69f-0ae8e7fcaead)

![Original DynamoDB table setup](https://github.com/user-attachments/assets/78fc6c7b-0657-4b0c-be7e-617497879a42)

</details>

<details>
<summary><strong>IAM permissions and Lambda processing</strong></summary>

The original implementation used a Lambda execution role to
permit database writes.

The current infrastructure template defines table-scoped
DynamoDB permissions and log-group-scoped logging permissions.

![IAM integration diagram](https://github.com/user-attachments/assets/757253d9-454c-46eb-82d8-854f6f3ad77e)

![Lambda integration diagram](https://github.com/user-attachments/assets/857dfaa0-e680-4246-bca7-3512b558f1eb)

![Original Lambda implementation](https://github.com/user-attachments/assets/d4f837d5-476e-48c8-b00c-064e0c90677b)

</details>

<details>
<summary><strong>API Gateway configuration</strong></summary>

The original REST API connected the authenticated frontend
to the Lambda function.

Any token visible in historical authorizer-testing screenshots
must be redacted before these images are shared publicly.

![API Gateway integration diagram](https://github.com/user-attachments/assets/7d826aec-bf18-471a-b724-32fbe387b042)

![Original API creation](https://github.com/user-attachments/assets/9df2fb58-f782-49a2-afcb-a0f3d746a54b)

![Cognito authorizer setup](https://github.com/user-attachments/assets/ca34a45e-654c-4e75-911d-74076864bfdc)

![Original authorizer configuration](https://github.com/user-attachments/assets/b50c0e8f-c021-4196-b657-4a1dc0432b59)

![Historical authorizer test](https://github.com/user-attachments/assets/7c83bb33-84f2-4c45-9d27-fd93e856e39b)

![API resource configuration](https://github.com/user-attachments/assets/fec36e9c-0214-4a3d-a97d-0dfa6e0fd6be)

![Original ride resource setup](https://github.com/user-attachments/assets/0d358969-bfe5-4760-add4-a18de16da4e0)

![API method creation](https://github.com/user-attachments/assets/4441b6d4-9613-48c7-855a-81f2dd06d051)

![Lambda proxy integration](https://github.com/user-attachments/assets/e2ae2584-b04e-44ea-ba04-34bbf4fd021c)

![Method request configuration](https://github.com/user-attachments/assets/ec72a1c9-20d6-422b-929b-dbeb15094fbc)

![Attaching the Cognito authorizer](https://github.com/user-attachments/assets/638b7da9-4d2c-4a6a-a207-7240d97213bf)

![Original API deployment stage](https://github.com/user-attachments/assets/5a568494-4b72-4386-b0b7-3cc7245b0f3f)

![Original API endpoint](https://github.com/user-attachments/assets/f49a0c50-db52-4cc8-8c13-b5ac556ec4f6)

![Original frontend API configuration](https://github.com/user-attachments/assets/53de71da-fa8b-498a-97f8-d9bf57b153e0)

</details>

<details>
<summary><strong>Original application demonstration</strong></summary>

These images show the application during the original deployment.
The current revision removes the workshop token-display interface
and simplifies the ride-request interaction.

![Original ride-request application](https://github.com/user-attachments/assets/8d5115c8-a6ee-4091-aeac-e322ed2726ff)

![Original Wild Rydes application demonstration](https://github.com/user-attachments/assets/52cfc440-da7c-4e4e-85ed-1bb0388cfb83)

</details>

## Repository Guide

| Path | Purpose |
|---|---|
| backend/request-ride/index.mjs | Lambda handler |
| backend/request-ride/index.test.mjs | Backend unit tests |
| backend/request-ride/package-lock.json | Locked backend dependencies |
| frontend-tests/playwright.config.cjs | Browser-test configuration |
| frontend-tests/tests/inactive-state.spec.cjs | Inactive-state browser tests |
| infra/template.yaml | SAM backend infrastructure definition |
| js/config.js | Frontend deployment configuration |
| js/cognito-auth.js | Registration, sign-in, verification, and sign-out |
| js/ride.js | Ride-request interface |
| docs/access-controls.md | Access-control design and limitations |
| docs/baseline.md | Project baseline |
| docs/test-results.md | Verification evidence |
| .github/workflows/validate.yml | Automated validation workflow |

## Run Backend Tests

Requires Node.js 22 and npm.

From the repository root:

```bash
cd backend/request-ride
npm ci
npm run check
npm test
```

The tests replace DynamoDB calls with mocks.
No AWS account or credentials are required.

### Backend Test Coverage

- Missing authentication claims.
- Malformed JSON.
- Missing coordinates.
- Out-of-range coordinates.
- Coordinates supplied as strings.
- Successful request and correct database command.
- Base64-encoded JSON.
- Missing table configuration.
- Database failure without internal error disclosure.
- Missing allowed-origin configuration.

## Run Browser Tests

Requires Node.js 22, npm, and Python 3.

From the repository root:

```bash
cd frontend-tests
npm ci
npx playwright install --with-deps chromium
npx playwright test --config=playwright.config.cjs
```

The tests start a local web server automatically.

### Browser Test Coverage

- Sign-in controls are disabled without AWS configuration.
- Registration controls are disabled without AWS configuration.
- Email-verification controls are disabled without AWS configuration.
- Ride requests are disabled and token-display elements are absent.
- Sign-out works without a configured user pool.

External traffic is blocked during these tests.
The map script is stubbed; map rendering is not tested.

## Validate and Build the Infrastructure

Requires AWS SAM CLI and Node.js 22.

From the repository root:

```bash
sam validate --lint --template-file infra/template.yaml
sam build --template-file infra/template.yaml
```

These commands validate the template and build the Lambda package.
They do not deploy AWS resources.

## Continuous Integration

GitHub Actions runs:

1. Frontend JavaScript syntax checks.
2. Locked backend dependency installation.
3. Lambda syntax checking and 10 unit tests.
4. Locked browser-test dependency installation.
5. Five Chromium browser tests.
6. SAM template validation.
7. Lambda deployment-package build.

[View workflow runs](https://github.com/samiqasem89/build-end-to-end-app/actions/workflows/validate.yml)

[Verified successful run](https://github.com/samiqasem89/build-end-to-end-app/actions/runs/39791062859)

This is a continuous integration workflow.
It does not deploy the application to AWS.

## Access-Control Design

### Application Authentication

Cognito handles application-user sign-in.

API Gateway is configured to validate Cognito tokens before
invoking POST /ride.

The Lambda handler checks for the expected username claim.
It does not independently verify JWT signatures.

### Lambda Execution Permissions

The template grants:

| Permission | Resource |
|---|---|
| dynamodb:PutItem | The project's rides table |
| logs:CreateLogStream | Streams within the function's log group |
| logs:PutLogEvents | Streams within the function's log group |

The function does not need logs:CreateLogGroup because the
template creates its log group.

### Browser Access

The configured frontend origin is used for CORS responses.

CORS is a browser response-access mechanism.
It does not replace authentication or IAM authorization.

### Logging

The handler logs event names, request IDs, and ride IDs.

It avoids logging full request events, authentication tokens,
passwords, and pickup coordinates.

Log retention is configured for seven days.

## Deployment Configuration

The frontend configuration is intentionally empty while the
project is inactive.

A future deployment requires these values in js/config.js:

- Cognito user pool ID.
- Cognito app client ID.
- AWS region.
- API base URL, without the /ride path.

The Lambda environment requires:

| Variable | Purpose |
|---|---|
| TABLE_NAME | Name of the project's DynamoDB table |
| ALLOWED_ORIGIN | Frontend origin without a trailing slash |

Never put AWS access keys, passwords, client secrets,
or authentication tokens in frontend configuration.

## Limitations and Future Work

- The current revision has not been deployed end to end in AWS.
- Live Cognito authentication and IAM enforcement remain unverified.
- Browser tests cover inactive behavior, not successful live sign-in.
- Inherited frontend libraries require modernization.
- MFA and differentiated application-user roles are not implemented.
- The interface blocks duplicate in-flight submissions, but the
  backend does not implement idempotency.
- Deployment automation is not configured.
- The application is an educational lab, not a production service.

## What I Practiced

- Separating application authentication from AWS service permissions.
- Defining resource-scoped IAM policies.
- Validating untrusted request data.
- Handling errors without exposing internal details.
- Avoiding sensitive information in logs and interface elements.
- Describing infrastructure with CloudFormation through AWS SAM.
- Testing backend behavior without contacting AWS.
- Testing frontend behavior in Chromium.
- Troubleshooting GitHub Actions and template-validation failures.
- Recording evidence and documenting verification limits.

## Project Background

This project builds on the AWS Wild Rydes workshop example.

The original application concept and inherited frontend assets
are not my original design.

My contributions include the documented implementation and
subsequent improvements to application code, access-control
configuration, infrastructure, tests, and documentation.

Existing third-party code and assets remain subject to their
original licenses.
