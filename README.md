# Wild Ryde Project 
![Wild Rydes - Google Chrome 2025-04-15 09-58-17 (1)](https://github.com/user-attachments/assets/52cfc440-da7c-4e4e-85ed-1bb0388cfb83)


I have developed an end-to-end AWS application that uses a variety of AWS services hosted on Amplify, using GitHub as a repository, Cognito for Authentication, Lambda for computation, 
DynamoDB is used for storage, IAM roles are used to grant Lambda permission to write on the DynamoDB database, and API Gateway is used to handle requests. The application for users to request a ride from unicorn on a city map. I would like to share with you the process to achieve it.



![Untitled Diagram drawio (1)](https://github.com/user-attachments/assets/4cce19c3-7e80-42c2-be15-319baf88f404)
## Amplify
Here is where our app will be hosted. Amplify is serverless, so we do not need to worry about servers and integration.
### Step 1: Navigate to the Amplify service in the AWS console. 

•	Create a new app and click on Host web app.\
There are two ways to work with Amplify:
 1.	Deploy with a Repository such as “GitHub - BitBucket - CodeCommit – GitLab”.
   ![02](https://github.com/user-attachments/assets/449c4743-f30a-4352-8141-ceef14c4e7f0)
 2.	Deploy without Git:\
•	“Drag and drop” a ZIP file meaning you will have to compress all files such as HTML to ZIP file. \
•	Amazon S3 \
•	Any URL
![01](https://github.com/user-attachments/assets/f0e7d629-ac08-4bb9-8b61-7737e8f12961)

#### We will choose GitHub as our repository. 
#### * You need to clone folders and files in this repository to your GitHub to be able to continue with me 
•	Connect your Amplify with GitHub \
•	Choose the name of your Repository\
#### *If you don't see the Repository, click `Update GitHub permissions` and navigate to the right repository 
•	Select a branch; usually, it will be `main`\
•	Keep everything as default. Continue `Next` to finish 
![03](https://github.com/user-attachments/assets/a2b6f683-056c-41e4-b938-79306ff8ef2f)

•	Provide an App name and Environmental name & `create a new role`. \
•	Choose `AWS service` & Service or use case `Amplify` \
•	After finishing reviewing the role, continue with `next` till the app is created
![04](https://github.com/user-attachments/assets/55b2743d-e4cc-467d-b00e-1c0b23b1b614)

#### Congratulations! We just deployed our app now. If you click on the domain, you should be able to see your frontend UI 

### Step 2: Test repository connectivity with `Amazon Amplify`.

•	Navigate to GitHub and find the `index.html` file \
•	On the top right of the code window, click `edit file` \
•	scroll down to any sentence you choose and modify it \
•	Go back to Amplify, and you will notice that it will start deploying again\
•	Once deployment finishes refreshing your webpage, you will notice the sentence you have changed in the GitHub is now displayed on the page. 

#### We have created CI/CD deployment.



![Untitled Diagram drawio](https://github.com/user-attachments/assets/bb6da760-8967-4e01-a318-2ee5364dd05f)

## Cognito
Cognito is service to create authentication & login to our app
### Step 3: Navigate to Cognito service in the AWS console. 
•	Click `Create user pool` \
•	Choose `Traditional web application`\
•	Choose `Email` in the configure options\
•	Choose `email` Required attributes for sign-up `Next`\
•	Save the `User pool ID` in the text editor 

#### Go to `App clients`
•	Choose the `App client` you have created \
•	Save the `Client ID` in the text editor 

#### You can also change the default name by clicking `Edit` on the section `App client information`
•	Go to your repository in GitHub\
•	Find the File `config.js` in the `js` Folder \
•	Click on `Edit` this file from the top right as it's showing below
![07](https://github.com/user-attachments/assets/06b6ddf4-9211-4a67-ba9a-0967ffc40f9a)
#### We will need to update the following:
•	From Cognito, we will need the `UserPoolId:`  & `userPoolClientId` that we saved in the text editor 
•	The `region`  in which our services were deployed. 


#### `invokeUrl;` we will get to this later when we create the ‘API Gateway’
•	Click `Commit Changes`\
•	Go back to `Amplify` and wait until it finishes deploying \
•	Navigate to the webpage and click \
#### GIDDY UP!
•	Enter the valid email you used in Cognito and password\
•	Go to your mail, copy the `Authentication code` & paste it into the webpage followed by the email you used.

#### Congratulations! We have now signed into our app
•	Copy the `Auth Token` to a text editor 

![Untitled Diagram drawio (2)](https://github.com/user-attachments/assets/576a77bf-ee6e-45e8-b69f-0ae8e7fcaead)
## DynamoDB
DynamoDb is a fully managed, serverless NoSQL database. 
•	Navigate to DynamoDB to create a table 
•	Click on `Create a table`\
•	Name your table & add ‘RideId’ in the `Partition key`\
•	Leave everything default and click `Create table`\
•	Navigate to  the created table and copy the `(ARN)` and save it in the text editor 

![08](https://github.com/user-attachments/assets/78fc6c7b-0657-4b0c-be7e-617497879a42)


![Untitled Diagram drawio (3)](https://github.com/user-attachments/assets/757253d9-454c-46eb-82d8-854f6f3ad77e)

## IAM
AWS Identity and Access Management (IAM) is used to securely controlling access to AWS services.
### Step 4: Navigate to IAM service in the AWS console.
We now need to create a role to give the Lambda function permission to write to the DynamoDB\
•	Navigate to `IAM` 
•	On the left list, click `Roles`
•	Creating new Role
•	Click on `AWS service` then on the lower section `the Service or use case` choose `Lambda`
•	Next on the Add permissions page, search for the policy `AWSLambdaBasicExecutionRole`  and click Check and hit `Next`
•	Name your Role. Scroll down and `Create role`\

We need to add another Policy to the Role \
•	Navigate to the Role you have just created \
•	Click on the Role & on the section Premissions policies click on `Add permissions`  > `Create inline policy`\
•	On the new page, enter the Service `DynamoDB`\
•	On Filter Action, enter `putitem` and choose specific    
•	Click on `Add ARNs`, and here we will paste the DynamoDB ARN we have saved in our text editor and click `Next`/
•	Create Policy Name/
•	Click `Create policy`

![Untitled Diagram drawio (4)](https://github.com/user-attachments/assets/857dfaa0-e680-4246-bca7-3512b558f1eb)
## Lambda
Lambda is a serverless compute service. It enables you to run Code Without Provisioning or Managing Infrastructure
### Step 5: Navigate to Cognito service in the AWS console.
•	Navigate to `lambda` from the console 
•	Click `Create function`\
•	Click `Author from scratch` \
•	Input function name \
•	Runtime `Node.js 20.x`\
•	On the `Change default execution role` change the default to `Use an existing role` and add the Role we just created\
•	Click `Create Function` 
•	On the Code section window 
#### Copy and paste the new code in the code section 

```
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
    if (!event.requestContext.authorizer) {
        return errorResponse('Authorization not configured', context.awsRequestId);
    }

    const rideId = toUrlString(randomBytes(16));
    console.log('Received event (', rideId, '): ', event);

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
    console.log('Finding unicorn for ', pickupLocation.Latitude, ', ', pickupLocation.Longitude);
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

function errorResponse(errorMessage, awsRequestId) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}

```
#### Make sure the name of the `DynamoDB table` in the new code matches the one we have created earlier
![09](https://github.com/user-attachments/assets/d4f837d5-476e-48c8-b00c-064e0c90677b)

•	Click `Deploy` \
•	Click on `Test` 
•	Give it a name and save it 
#### copy and pasted the following code to the code field
```
{
    "path": "/ride",
    "httpMethod": "POST",
    "headers": {
        "Accept": "*/*",
        "Authorization": "eyJraWQiOiJLTzRVMWZs",
        "content-type": "application/json; charset=UTF-8"
    },
    "queryStringParameters": null,
    "pathParameters": null,
    "requestContext": {
        "authorizer": {
            "claims": {
                "cognito:username": "the_username"
            }
        }
    },
    "body": "{\"PickupLocation\":{\"Latitude\":47.6174755835663,\"Longitude\":-122.28837066650185}}"
}
```
•	Click 'Test`\
•	The test will return `status 200` to confirm the `Lambda` as it should be

#### Let's check if our DynamoDB is working
•	Now navigate to DynamoDB and click the table you have created\
•	Click on the `Explore items` \
#### A new item has been created from the `Test` in the `lambda function` 


![Untitled Diagram drawio (5)](https://github.com/user-attachments/assets/7d826aec-bf18-471a-b724-32fbe387b042)
## API Gateway
API gateway can secure traffic between API consumer requests and the execution of services
### Step 6: Navigate to Cognito service in the AWS console.
•	Navigate to Gateway API\
•	On `RESR API` Click Build\
•	Click on New API\
•	Enter a name \
•	Click `Create API`
![11](https://github.com/user-attachments/assets/9df2fb58-f782-49a2-afcb-a0f3d746a54b)
#### Now, because we are using Cognito, we have to create Authorizers in API. The API will use a Token that Cognito returned.
•	On the left list, click `Authorizer` \
•	Create a name for the Authorizer name\
•	On `Authorizer Type,` Check `Cognito`\
•	On `Cognito` search for the Cognito we created earlier\ 
•	On Token source Type `Authorization`\
•	Click `Create authorizer`
![12](https://github.com/user-attachments/assets/ca34a45e-654c-4e75-911d-74076864bfdc)

•	Go into the created authorizer
![13](https://github.com/user-attachments/assets/b50c0e8f-c021-4196-b657-4a1dc0432b59)

•	Go to the Text editor and copy the `Token` we have copied earlier from the webpage and paste it into\ 
•	In the field in the `Token value` and click `Test authorizer`
![22](https://github.com/user-attachments/assets/7c83bb33-84f2-4c45-9d27-fd93e856e39b)
•	Status of 200 will be returned to confirm that `API Authorizer` is working\
•	On the left menu, click `resources` >  `create resource`
![14](https://github.com/user-attachments/assets/fec36e9c-0214-4a3d-a97d-0dfa6e0fd6be)

•	On this page, add a resource name `/ride`. *This could be anything you want \
•	Make sure you have checked on `CORS` \
•	Click `Create resource`
![15](https://github.com/user-attachments/assets/0d358969-bfe5-4760-add4-a18de16da4e0)

•	Go back to the main page and click on `/ride` we have created 
•	Click `Create method`
![16](https://github.com/user-attachments/assets/4441b6d4-9613-48c7-855a-81f2dd06d051)
•	Choose `POST` \
•	On Integration type choose `Lambda function`\
•	Click on `Lambda proxy integration`\
•	Choose the `lambda function` we created earlier\
•	Click `Create method`
![17](https://github.com/user-attachments/assets/e2ae2584-b04e-44ea-ba04-34bbf4fd021c)

•	On the Post under the `Method request` tab, click `Edit` 
![23](https://github.com/user-attachments/assets/ec72a1c9-20d6-422b-929b-dbeb15094fbc)

#### Here is where we will hook up our Authorization 
•	Look up the `Cognito` we have created \
•	Click `Save`
![19](https://github.com/user-attachments/assets/638b7da9-4d2c-4a6a-a207-7240d97213bf)
•	Click `Deploy` \
•	Create a `new stage` and name it `dev`. Or anything you want \
•	Click `Deploy` again
![20](https://github.com/user-attachments/assets/5a568494-4b72-4386-b0b7-3cc7245b0f3f)
•	Copy the `Invoke URL`
![21](https://github.com/user-attachments/assets/f49a0c50-db52-4cc8-8c13-b5ac556ec4f6)
•	Navigate to the `GitHub` Repo again and open `config.js` 
•	Edit and replace the `invoke URL` with the new URL we just created 
•	Click `Commit changes`
![24](https://github.com/user-attachments/assets/53de71da-fa8b-498a-97f8-d9bf57b153e0)
•	Navigate back to the `Web-App`\ 
•	Click on any location on the map\
•	Choose request Unicorn 
![25](https://github.com/user-attachments/assets/8d5115c8-a6ee-4091-aeac-e322ed2726ff)








