import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
	return ddb.get({ key: { id: ctx.args.id } })
}

export function response(ctx) {
	//if the owner field isn't the same as the identity, the throw
	const tenantName = ctx.identity.claims['custom:tenantName']

	if (ctx.result.tenantId !== tenantName) {
		util.unauthorized()
	}

	return ctx.result
}
