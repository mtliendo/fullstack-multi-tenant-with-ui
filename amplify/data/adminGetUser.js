//https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html
export function request(ctx) {
	const username = ctx.identity.username

	return {
		resourcePath: '/',
		method: 'POST',
		params: {
			headers: {
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.AdminGetUser',
			},
			body: {
				UserPoolId: ctx.env.COGNITO_USER_POOL_ID,
				Username: username,
			},
		},
	}
}

export function response(ctx) {
	const res = JSON.parse(ctx.result.body)
	console.log('the user res', res)
	const tenantName = res.UserAttributes.find(
		(attr) => attr.Name === 'custom:tenantName'
	).Value
	console.log('the tenantName', tenantName)
	return { tenantName }
}
