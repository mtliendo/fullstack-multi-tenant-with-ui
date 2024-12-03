import { postConfirmation } from './functions/postconfirmation/resource'
import { preSignUp } from './functions/presignup/resource'
import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { createTable } from './customResources/tables/createTables'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb'

const backend = defineBackend({
	auth,
	data,
	preSignUp,
	postConfirmation,
})

const customResourceStack = backend.createStack('customresources')

const tenantTable = createTable(customResourceStack, 'tenantTable', 'name')
const tenantTodoTable = createTable(
	customResourceStack,
	'tenantTodoTable',
	'id'
)

tenantTodoTable.addGlobalSecondaryIndex({
	indexName: 'byTenantName',
	partitionKey: { name: 'tenantId', type: AttributeType.STRING },
})

tenantTable.grantReadData(backend.preSignUp.resources.lambda)
tenantTable.grantWriteData(backend.postConfirmation.resources.lambda)

backend.preSignUp.resources.cfnResources.cfnFunction.environment = {
	variables: {
		TENANT_TABLE_NAME: tenantTable.tableName,
	},
}
backend.postConfirmation.resources.cfnResources.cfnFunction.environment = {
	variables: {
		TENANT_TABLE_NAME: tenantTable.tableName,
		ADMIN_GROUP_NAME: 'admin',
	},
}
backend.data.resources.cfnResources.cfnGraphqlApi.environmentVariables = {
	COGNITO_USER_POOL_ID: backend.auth.resources.userPool.userPoolId,
	NON_ADMIN_GROUP_NAME: 'user',
}
backend.data.addDynamoDbDataSource('tenantTableDS', tenantTable)
backend.data.addDynamoDbDataSource('tenantTodoTableDS', tenantTodoTable)

const cognitoDS = backend.data.addHttpDataSource(
	'cognitoDS',
	'https://cognito-idp.us-east-1.amazonaws.com',
	{
		authorizationConfig: {
			signingRegion: 'us-east-1',
			signingServiceName: 'cognito-idp',
		},
	}
)
//allow the datasource to call the createAdminUser operation
cognitoDS.grantPrincipal.addToPrincipalPolicy(
	new PolicyStatement({
		actions: [
			'cognito-idp:AdminCreateUser',
			'cognito-idp:AdminAddUserToGroup',
			'cognito-idp:AdminGetUser',
		],
		resources: [backend.auth.resources.userPool.userPoolArn],
	})
)
// extract L1 CfnUserPool resources
const { cfnUserPool } = backend.auth.resources.cfnResources
// update the schema property to add custom attributes
if (Array.isArray(cfnUserPool.schema)) {
	cfnUserPool.schema.push({
		name: 'tenantName',
		attributeDataType: 'String',
	})
}
