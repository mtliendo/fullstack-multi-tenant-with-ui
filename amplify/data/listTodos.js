import * as ddb from '@aws-appsync/utils/dynamodb'

// list only your tenant todos
export function request(ctx) {
	console.log('args', ctx.args)
	console.log('identity', ctx.identity)
	const tenantName = ctx.prev.result.tenantName
	console.log('request', tenantName)
	return ddb.query({
		query: { tenantId: { eq: tenantName } },
		index: 'byTenantName',
		limit: ctx.args.limit || 50,
		nextToken: ctx.args.nextToken,
	})
}

export function response(ctx) {
	const { items: todos = [], nextToken } = ctx.result
	return { todos, nextToken }
}
