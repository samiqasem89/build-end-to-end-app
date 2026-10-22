# Current Project Baseline

## Project Status

This repository contains an AWS serverless application lab
based on the Wild Rydes workshop.

The original application was deployed previously.
The AWS resources are not currently deployed.

The current revision is verified through automated code checks,
unit tests, browser tests, infrastructure validation, and packaging.

## Original Architecture

- Amplify: Frontend hosting and GitHub integration.
- Cognito: Application-user authentication.
- API Gateway: Authenticated REST API.
- Lambda: Ride-request processing.
- DynamoDB: Ride-record storage.
- IAM: Service permissions.
- CloudWatch Logs: Execution logging.

Historical screenshots remain in README.md.
They are evidence of the original implementation, not verification
of the current revision.

## Completed Improvements

- Extracted Lambda code into backend/request-ride/index.mjs.
- Added JSON and coordinate validation.
- Added controlled error responses.
- Removed full-request and pickup-coordinate logging.
- Made the table name and allowed origin configurable.
- Removed frontend authentication-token display.
- Added authentication and request-readiness guards.
- Prevented duplicate in-flight submissions.
- Connected sign-out and handled missing configuration.
- Used text insertion for frontend status messages.
- Cleared historical AWS connection settings.
- Defined backend resources using AWS SAM.
- Scoped Lambda database and logging permissions.
- Configured seven-day log retention.
- Added dependency lockfiles and reproducible installations.
- Added backend and browser tests.
- Integrated verification into GitHub Actions.

## Verified Checks

| Check | Result |
|---|---|
| Frontend JavaScript syntax | Passed |
| Lambda JavaScript syntax | Passed |
| Backend unit tests | 10 passed |
| Chromium inactive-state tests | 5 passed |
| SAM template linting | Passed |
| Lambda package build | Passed |

Evidence:
https://github.com/samiqasem89/aws-serverless-security-lab/actions/runs/39791062859

## Verification Boundaries

Backend tests mock DynamoDB calls.

Browser tests use empty AWS configuration, block external
traffic, and stub the external map script.

These checks do not verify:
- Live Cognito token validation.
- IAM permissions enforced by AWS.
- Actual database writes.
- Deployed API Gateway behavior.
- Map rendering.
- End-to-end functionality in AWS.

## Remaining Work

- Modernize inherited frontend libraries.
- Expand browser tests using simulated configured sessions.
- Test successful and failed frontend API requests with mocks.
- Review historical screenshots for sensitive information.
- Add a current architecture diagram.
- Consider backend idempotency.
- Redeploy and perform live integration tests when AWS use resumes.

## Current Scope

Development and verification are being performed through
GitHub and local or Codespaces tooling.

AWS deployment is intentionally deferred.
