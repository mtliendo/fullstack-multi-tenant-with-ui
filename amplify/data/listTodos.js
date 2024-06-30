import * as ddb from '@aws-appsync/utils/dynamodb'

// list only your tenant todos
export function request(ctx) {
	const tenantName = ctx.identity.claims['custom:tenantName']

	return ddb.query({
		query: { tenantId: { eq: tenantName } },
		index: 'byTenantName',
		limit: ctx.args.limit,
		nextToken: ctx.args.nextToken,
	})
}

export function response(ctx) {
	const { items: todos = [], nextToken } = ctx.result
	return { todos, nextToken }
}
