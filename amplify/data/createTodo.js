import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	const id = util.autoId()

	console.log('the ctx', ctx)
	const tenantName = ctx.prev.result.tenantName
	const now = util.time.nowISO8601()
	const item = {
		id,
		tenantId: tenantName,
		createdAt: now,
		updatedAt: now,
		completed: false,
		name: ctx.args.name,
	}
	console.log('the full item', item)

	return ddb.put({
		key: { id },
		item,
	})
}

export function response(ctx) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type)
	}
	console.log('the ctx', ctx)
	console.log('the result', ctx.result)
	return ctx.result
}
