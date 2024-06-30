# Multi-tenant Data access

This app is a continutation of what I have [here](https://github.com/mtliendo/fullstack-multi-tenant-signup-triggers).

In this setup, I'll make it so only admins can perform certain actions like adding new users to their tenant, and crud operations that pertain to a specific tenant.

This means I should only allow API operations based on tenantId from cognito.

This is _very_ similar to how Amplify generates `owner` based data flows now, but I'll add a condition that the user has to have the right `tenantId` (`ctx.identity.claims.tenantId`) in the resolver, and be part of the right group on the schema.

> 🗒️ What's nice about this approach is that while we are supplying our own database, Amplify will still supply the type inference on our schema so there will be no handcrafted data operations. We won't be able to use `client.models`, but fortunately we can fallback to `client.[query | mutation]`

## Application Setup

Currently, a user can view the homepage, signin, get redirected to their tenant page. This user us the admin user. I have a decision to make: Should I implement CRUD functionality, or createUser functionality. Well...it doesn't matter if I add a user if they can't do anything, so I'm going with CRUD functionality.

My understanding is that this is very similar to what I did [here](https://github.com/focusOtter/fullstack-nextjs-cdk-starter/tree/main/_backend/lib/api/TS_functions) in my CDK starter repo. Except instead of checking if they are the owner of a `Todo`, we are checking if the custom attribute they have, matches the tenant info on the data.

We're still keeping things simple and working with `Todo` but I hope to switch this up soon!

## CRUD Operation Creation

I'll be using my [CDK Starter](https://github.com/focusOtter/fullstack-nextjs-cdk-starter/blob/main/_backend/lib/api/TS_functions/createTodo.ts) repo a guide for all of my resolvers

### Create

As with most apps, any signed in user (or in our case a `admin` or `user` group member) can create an item. But when you do the `tenantId` is stored on the object. This is never sent back to the client.

```js
import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	const id = util.autoId()
	const identity = ctx.identity
	const now = util.time.nowISO8601()

	const item = {
		id,
		tenantId: identity.claims.tenantId,
		createdAt: now,
		updatedAt: now,
		completed: false,
		name: ctx.args.name,
	}

	return ddb.put({
		key: { id },
		item,
	})
}

export function response(ctx) {
	return ctx.result
}
```

### Read

As long as your in the right group, you can attempt to get an item from the database. However the response will only contain a result if the tenantId matches the tenantId stored on the item. Otherwise, you'll get `unauthorized`.

```js
import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	return ddb.get({ key: { id: ctx.args.id } })
}

export function response(ctx) {
	//if the owner field isn't the same as the identity, the throw
	const identity = ctx.identity
	if (ctx.result.tenantId !== identity.claims.tenantId) {
		util.unauthorized()
	}

	return ctx.result
}
```

### Update

In this example, we'll use DDB conditions to ensure an item is only updated if the tenantId of the use equals `eq` the tenantId field of the item.

```js
import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	const id = ctx.args.id
	const { tenantId } = ctx.identity.claims
	const now = util.time.nowISO8601()

	// update it if owner.
	const updateObj = {
		name: ddb.operations.replace(ctx.args.name),
		completed: ddb.operations.replace(ctx.args.completed),
		updatedAt: ddb.operations.replace(now),
	}

	return ddb.update({
		key: { id },
		update: updateObj,
		condition: { tenantId: { eq: tenantId } },
	})
}

export function response(ctx) {
	return ctx.result
}
```

### Delete

Similar to updating an item, a user can only delete if the condition is met on the `tenantId`.

```js
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	// delete a todo by its id if it's the owner
	const { tenantId } = ctx.identity.claims
	return ddb.remove({
		key: { id: ctx.args.id },
		condition: { tenantId: { eq: tenantId } },
	})
}

export function response(ctx) {
	return ctx.result
}
```

### Listing

This is going to use a `query` instead of a `scan`. It's essentially saying, "Give me all of the `Todo`s with a `tenantId` equal to the cognito attribute. This will use pagination so I'll have to implement a `limit` and `nextToken`.

```js
import * as ddb from '@aws-appsync/utils/dynamodb'

// list only your tenant todos
export function request(ctx) {
	const { tenantId } = ctx.identity.claims
	return ddb.query({
		query: { tenantId: { eq: tenantId } },
		limit: ctx.args.limit,
		nextToken: ctx.args.nextToken,
	})
}

export function response(ctx) {
	const { items: todos = [], nextToken } = ctx.result
	return { todos, nextToken }
}
```

This entire section until now has been extrememly easy! By far the easiest part of this whole project. Note that I tested all of these operations in the AppSync Console since I don't have any UI created for this yet.

## Creating an `adminCreateUser` flow

There are two ways to do this: I can either use a lambda function, or I can use a custom resolver. A lambda function will take minimal effor according to [this doc](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/AdminCreateUserCommand/). I bet I could get this done in 30 minutes.

A custom resolver will require me to learn to how to use cognito as a datasource, get the signing name, and construct the request/response. This will take research and likely 1hr to 90 mins.

Obviously I'm going to use a custom resolver 😈

Alright, so [here is the doc](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html) that I'm following to get the structure correct. At the end of the day, this is just an [HTTP Resolver](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-reference-http-js.html).

In terms of the service endpoint, Cognito has 3 types: user pool, identity pool, and sync. Sync is out since that's not really used anymore. Since this is about create a user, I'm going to try the [userpool endpoint](https://docs.aws.amazon.com/general/latest/gr/cognito_identity.html)

For the creating the datasource I came up with this:

```ts
backend.data.addHttpDataSource(
	'cognito',
	'https://cognito-idp.us-east-1.amazonaws.com',
	{
		authorizationConfig: {
			signingRegion: 'us-east-1',
			signingServiceName: 'cognito-idp',
		},
	}
)
```

I then created an `adminCreateUser.js` file. Nothing in it, just stubbed.

For the operation itself, I created a mutation with the following:

```ts
createUser: a
	.mutation()
	.arguments({
		email: a.email().required(),
	})
	.returns(a.customType({ created: a.boolean().required() }))
	.handler([
		a.handler.custom({
			entry: './adminCreateUser.js',
			dataSource: 'cognitoDS',
		}),
	])
	.authorization((allow) => [allow.groups(['admin'])]),
```

I spent a few minutes trying to create the policy for the datasource. I knew what I had to do but forgot how to access it on the datasource. Fortunately I found my old project which showed [how to do just that](https://github.com/focusOtter/fullstack-message-scheduler/blob/amplify/amplify/backend.ts#L42-L47).

Tweaking it, I landed on the following:

```js
//allow the datasource to call the createAdminUser operation
cognitoDS.grantPrincipal.addToPrincipalPolicy(
	new PolicyStatement({
		actions: ['cognito-idp:AdminCreateUser'],
		resources: [backend.auth.resources.userPool.userPoolArn],
	})
)
```

> I'm surprised referencing the userpool ARN didn't cause a circular reference, but I think it's because a datasource is its own entity apart from the schema.

Now to create the actual resolver and test this out. The example from [the docs](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html) show this as a `post` request, and you get to the `admincreateuser` part by specifying a header. I've never had to do this before 🤪

> 🚨🚨 Oh wait...I have a bug...In all of my operations I'm pulling the tenantId from "ctx.identity.claims.tenantId", but it's [custom:tenantName]. My operations were working because the tenant is `undefined`. I added the following to the resolvers:

```js
const tenantName = ctx.identity.claims['custom:tenantName']
```

I was right that the headers are what dictate the cognito funciton to fire. So I had to update my headers as shown:

```js
headers: {
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': 'AWSCognitoIdentityProviderService.AdminCreateUser',
},
```

The rest of the resolver is what I have currently. I testing this and got it working. All in all, it wasn't too bad.

In testing, I realized 3 things:

1. The user wasn't being added to the `user` group.
2. The `postconfirmation` trigger wasn't firing.
3. When the user was created, the `presignup` trigger was being fired. So the signup was failing because it was checking if a tenant name was already created.

For the issue 1, I added another step in the pipeline. This step created a user. I simply updated the header and provided the right body params:

```js
{
		resourcePath: '/',
		method: 'POST',
		params: {
			headers: {
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.AdminAddUserToGroup',
			},
			body: {
				GroupName: ctx.env.NON_ADMIN_GROUP_NAME,
				Username: ctx.args.email,
				UserPoolId: ctx.env.COGNITO_USER_POOL_ID,
			},
		},
	}
```

That turned out to be really easy. Since it was a pipeline, I passed the user info and did an early return in case the user couldn't be created.

In the case of issue 2, there isn't anything I can do. This is apparently the [correct behavior](https://stackoverflow.com/questions/55688680/post-confirmation-doesnt-trigger-lambda-function).

For issue 3, I passed metadata as part of the create admin API phase:

```js
	ClientMetadata: {
					registeredByAdmin: 'true',
				},
```

So if the user was already created and signed up by an admin, my presignup function would simply let them in:

```js
if (event.request.clientMetadata?.registeredByAdmin) {
	return event
}
```

With all of that in place, I decided to delete my sandbox and do a quick check to make sure everything is working...

**In the UI**

- I am able to signup with `mtliendo@focusotter.com` and set `focusotter` be the tenant name.
- I am able to signup with `mtliendo@gmail.com` and set `mtliendo` as the tenant name.
- I am not able to signup `mtliendo+hey@focusotter.com` since my presignup trigger will prevent me from doing so.

**In the AppSync Console**

- I can create a new user: `mtliendo+otter@focusotter.com` and verify them in the UI.
- As an admin, I can create a `todo` item
- As an admin, I can update a `todo` item
- As an admin, I can get a `todo` item
- As an admin, I CAN'T list an arry of`todo` items 👀

I bet this is because I don't have a GSI on my table and instead just have an `id`. I added the following:

```js
tenantTodoTable.addGlobalSecondaryIndex({
	indexName: 'byTenantName',
	partitionKey: { name: 'tenantId', type: AttributeType.STRING },
})
```

Note that even after the deploy, the GSI wasn't done. So my query still returned an empty array. Once DynamoDB was done creating the index, I got the correct results.

- As an admin, I can list an arry of`todo` items
- As an admin, I can delete a `todo` item

- As a DIFFERENT admin, I can list only items in my tenant
- As a DIFFERENT admin, I can create a user for my tenant
- As a DIFFERENT USER IN A TENANT, I can list todos only for my tenant
- I verified that a USER can not CREATE A TENANT. They receive an "unauthorized" error.

I wanted to distinguish between signing in and creating a new tenant, so I updated the tab bar:

```ts
import { Authenticator, Input, Label } from '@aws-amplify/ui-react'
import { I18n } from 'aws-amplify/utils'

I18n.putVocabulariesForLanguage('en', {
	'Create Account': 'Register New Tenant',
})
```

## Moving Beyond: Creating the UI

I now having a working sample that allows users to signup with an available tenant name, and become an admin of the newly created tenant.

Next steps are to create the UI for this thing and deploy it to the masses!
