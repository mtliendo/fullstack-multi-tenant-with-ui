import { Stack } from 'aws-cdk-lib'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'

export const createTable = (
	stack: Stack,
	logicalId: string,
	partitionKey: string
) => {
	return new Table(stack, logicalId, {
		partitionKey: {
			name: partitionKey,
			type: AttributeType.STRING,
		},
	})
}
