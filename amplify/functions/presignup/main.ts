import type { PreSignUpTriggerHandler } from 'aws-lambda'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient()

async function getItem(key: string, tableName: string) {
	const params = {
		TableName: tableName,
		Key: {
			name: { S: key }, // Assuming name is the primary key and is of type string. Adjust if needed.
		},
	}

	try {
		const results = await client.send(new GetItemCommand(params))
		if (results.Item) {
			return unmarshall(results.Item)
		} else {
			return null // or throw an error if the item doesn't exist
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}

export const handler: PreSignUpTriggerHandler = async (event) => {
	console.log('the attrs', event.request.userAttributes)
	const submittedTenantName = event.request.userAttributes['custom:tenantName']

	const fetchedItem = await getItem(
		submittedTenantName,
		process.env.TENANT_TABLE_NAME!
	)

	if (fetchedItem) {
		throw new Error('Tenant already exists')
	}

	return event
}
