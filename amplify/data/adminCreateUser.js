//https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html
export function request(ctx) {
	const tenantName = ctx.identity.claims['custom:tenantName']

	return {
		resourcePath: '/',
		method: 'POST',
		params: {
			headers: {
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.AdminCreateUser',
			},
			body: {
				UserPoolId: ctx.env.COGNITO_USER_POOL_ID,
				Username: ctx.args.email,
				UserAttributes: [
					{
						Name: 'email',
						Value: ctx.args.email,
					},
					{
						Name: 'custom:tenantName',
						Value: tenantName,
					},
				],
				ClientMetadata: {
					registeredByAdmin: 'true',
				},
			},
		},
	}
}

export function response(ctx) {
	const user = JSON.parse(ctx.result.body).User
	if (!user) {
		return { created: false }
	}
	return { created: true, user }
}
