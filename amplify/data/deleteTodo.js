import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	// delete a todo by its id if it's the owner
	const tenantName = ctx.identity.claims['custom:tenantName']
	return ddb.remove({
		key: { id: ctx.args.id },
		condition: { tenantId: { eq: tenantName } },
	})
}

export function response(ctx) {
	return ctx.result
}
