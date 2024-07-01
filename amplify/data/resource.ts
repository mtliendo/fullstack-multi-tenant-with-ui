import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
	TodoResponse: a.customType({
		id: a.id().required(),
		createdAt: a.datetime().required(),
		updatedAt: a.datetime().required(),
		name: a.string().required(),
		completed: a.boolean().required(),
	}),
	ListTodosResponse: a.customType({
		todos: a.ref('TodoResponse').array().required(),
		nextToken: a.string(),
	}),
	getTodo: a
		.query()
		.arguments({ id: a.string().required() })
		.returns(a.ref('TodoResponse'))
		.handler([
			a.handler.custom({
				entry: './getTodo.js',
				dataSource: 'tenantTodoTableDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin', 'user'])]),
	createTodo: a
		.mutation()
		.arguments({ name: a.string().required() })
		.returns(a.ref('TodoResponse'))
		.handler([
			a.handler.custom({
				entry: './createTodo.js',
				dataSource: 'tenantTodoTableDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin', 'user'])]),
	updateTodo: a
		.mutation()
		.arguments({
			id: a.id().required(),
			name: a.string().required(),
			completed: a.boolean().required(),
		})
		.returns(a.ref('TodoResponse'))
		.handler([
			a.handler.custom({
				entry: './updateTodo.js',
				dataSource: 'tenantTodoTableDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin', 'user'])]),
	deleteTodo: a
		.mutation()
		.arguments({ id: a.id().required() })
		.returns(a.ref('TodoResponse'))
		.handler([
			a.handler.custom({
				entry: './deleteTodo.js',
				dataSource: 'tenantTodoTableDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin', 'user'])]),
	listTodos: a
		.query()
		.arguments({
			limit: a.integer(),
			nextToken: a.string(),
		})
		.returns(a.ref('ListTodosResponse'))
		.handler([
			a.handler.custom({
				entry: './listTodos.js',
				dataSource: 'tenantTodoTableDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin', 'user'])]),
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
			a.handler.custom({
				entry: './adminAddUserToGroup.js',
				dataSource: 'cognitoDS',
			}),
		])
		.authorization((allow) => [allow.groups(['admin'])]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
	name: 'multi-tenant-app',
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool',
		apiKeyAuthorizationMode: {
			expiresInDays: 20,
		},
	},
})
