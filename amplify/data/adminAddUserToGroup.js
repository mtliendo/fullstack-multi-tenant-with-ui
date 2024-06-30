//docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminAddUserToGroup.html
import { runtime } from '@aws-appsync/utils'
export function request(ctx) {
	if (!ctx.prev.result.created) {
		runtime.earlyReturn({ created: false })
	}
	return {
		resourcePath: '/',
		method: 'POST',
		params: {
			headers: {
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.AdminAddUserToGroup',
			},
			body: {
				GroupName: ctx.env.NON_ADMIN_GROUP_NAME,
				Username: ctx.args.email,
				UserPoolId: ctx.env.COGNITO_USER_POOL_ID,
			},
		},
	}
}

export function response(ctx) {
	console.log('the context', ctx)

	return { created: true }
}
