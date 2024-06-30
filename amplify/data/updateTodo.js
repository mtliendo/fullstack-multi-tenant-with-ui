import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	const id = ctx.args.id
	const tenantName = ctx.identity.claims['custom:tenantName']

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
		condition: { tenantId: { eq: tenantName } },
	})
}

export function response(ctx) {
	return ctx.result
}
