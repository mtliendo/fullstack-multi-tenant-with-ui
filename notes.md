# Amplify with cognito triggers

This app is a continutation of what I have [here](https://github.com/mtliendo/fullstack-amplify-custom-cognito-attribute).

In this setup, I'll allow a user to signup only if they pick a tenant name that is not taken.

Tenant names are stored in DynamoDB.

If a tenant name is available, then the tenant name in stored in DynamoDB and the user can proceed with signup. This is all handled in a `presignup` trigger.

Once signed up, a `postconfirmation` trigger adds the user to an `admin` group,

A consideration: The generated api routes from using `@model` won't serve me any purpose since each resolver will need to do a check against the tenantID. Because of that, I'll just create my own tables in the CDK. One for the `Todos` and another for the `Tenant`.

## Application Setup

My triggers will validate against a database, so I'll create those realquick:

Since I wanted these resources created in the same stack, I referenced an existing auth resource's stack. From there, I created it as I would normally in the CDK:

```ts
const tenantTable = new Table(thisStack, 'tenantTable', {
	partitionKey: {
		name: 'id',
		type: AttributeType.STRING,
	},
})

tenantTable.addGlobalSecondaryIndex({
	indexName: 'tenantByName',
	partitionKey: {
		name: 'name',
		type: AttributeType.STRING,
	},
})
```

Then I added it as a datasource:

```ts
backend.data.addDynamoDbDataSource('tenantTableDS', tenantTable)
```

## PreSignup Trigger

Ok. So the rest of this project took a day and a half because of trial and error and some Amplify limitations. Here is the rundown:

The presignup trigger needs to get the custom user attribute and check if it exists in a tenant table.

- I tried to first do cognito -> lambda -> appsync -> dynamodb since I could use a custom resolver. This doesn't work because Amplify can't current assign the `@aws_iam` directive to specific queries and mutations. Note the function will have the right permissions, but the query themselves will deny access.
- I then went cognito -> lambda -> dynamodb. This didn't work because of a common cyclical reference: between auth, db and function.
- The solution was to put the database in a separate stack: cognito -> lambda -> (db in stack2)

Once I figured that out, the rest was trivial

```ts
export const handler: PreSignUpTriggerHandler = async (event) => {
	console.log('the attrs', event.request.userAttributes)
	const submittedTenantName = event.request.userAttributes['custom:tenantName']

	const fetchedItem = await getItem(
		submittedTenantName,
		process.env.TENANT_TABLE_NAME!
	)

	if (fetchedItem) {
		throw new Error('Tenant already exists')
	}

	return event
}
```

Note that I had to use `process.env.TENANT_TABLE_NAME` instead of the Amplify way of handling [env vars](https://docs.amplify.aws/react/deploy-and-host/fullstack-branching/secrets-and-vars/#local-environment).

## PostConfirmation Trigger

Once a user is confirmed, we can secure their tenant and mark them as an admin. This was fairly easy since all the thought planning went into the presignup trigger:

```ts
export const handler: PostConfirmationTriggerHandler = async (event) => {
	const tenantName = event.request.userAttributes['custom:tenantName']
	const now = new Date().toISOString()
	const { userName, userPoolId } = event
	const groupName = process.env.ADMIN_GROUP_NAME!

	await addAdminToGroup(userName, userPoolId, groupName)

	const params = {
		TableName: process.env.TENANT_TABLE_NAME,
		Item: marshall({
			name: tenantName,
			createdAt: now,
			updatedAt: now,
		}),
	}
	await ddbClient.send(new PutItemCommand(params))

	return event
}
```

The docs on [adding a user to a group](https://docs.amplify.aws/react/build-a-backend/functions/examples/add-user-to-group/) were especially useful here, especially when combined with my repo showing various crud operations with [dynamodb and lambda](https://github.com/focusOtter/fullstack-apigw-cdk-nextjs/blob/main/backend/lib/functions/putPetsFunc/main.ts)

## Moving Beyond

I now having a working sample that allows users to signup with an available tenant name, and become an admin of the newly created tenant. In the last(?) part, I'll make it so only admins can perform certain actions like adding new users to their tenant, and crud operations that pertain to a specific tenant.

### Working with AppSync API

Next step would be to only allow API operations based on tenantId from cognito.

This is _very_ similar to how Amplify generates `owner` based data flows now, but we'll add a condition that the user has to have the right tenantId (ctx.identity.claims.tenantId) in the resolver, and be part of the right group on the schema.
