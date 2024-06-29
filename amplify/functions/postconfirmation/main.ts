import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import {
	CognitoIdentityProviderClient,
	AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
const ddbClient = new DynamoDBClient()

const cognitoClient = new CognitoIdentityProviderClient()

const addAdminToGroup = async (
	userName: string,
	userPoolId: string,
	groupName: string
) => {
	const command = new AdminAddUserToGroupCommand({
		GroupName: groupName,
		Username: userName,
		UserPoolId: userPoolId,
	})
	await cognitoClient.send(command)
}
export const handler: PostConfirmationTriggerHandler = async (event) => {
	const tenantName = event.request.userAttributes['custom:tenantName']
	const now = new Date().toISOString()
	const { userName, userPoolId } = event
	const groupName = process.env.ADMIN_GROUP_NAME!

	await addAdminToGroup(userName, userPoolId, groupName)

	const params = {
		TableName: process.env.TENANT_TABLE_NAME,
		Item: marshall({
			name: tenantName,
			createdAt: now,
			updatedAt: now,
		}),
	}
	await ddbClient.send(new PutItemCommand(params))

	return event
}
