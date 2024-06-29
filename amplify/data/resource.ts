import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
	TodoResponse: a.customType({
		id: a.id(),
		createdAt: a.datetime(),
		updatedAt: a.datetime(),
		name: a.string().required(),
		completed: a.boolean().required(),
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
