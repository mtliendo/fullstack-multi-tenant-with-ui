import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	const id = util.autoId()
	const identity = ctx.identity
	const now = util.time.nowISO8601()
	const item = {
		id,
		tenantId: identity.claims['custom:tenantName'],
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
