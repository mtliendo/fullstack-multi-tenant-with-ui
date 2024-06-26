import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
	Todo: a
		.model({
			content: a.string(),
		})
		.authorization((allow) => [allow.authenticated()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
	name: 'multi-tenant-app',
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool',
	},
})
