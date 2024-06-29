import { postConfirmation } from './functions/postconfirmation/resource'
import { preSignUp } from './functions/presignup/resource'
import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { createTable } from './customResources/tables/createTables'

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
backend.data.addDynamoDbDataSource('tenantTableDS', tenantTable)
backend.data.addDynamoDbDataSource('tenantTodoTableDS', tenantTodoTable)

// extract L1 CfnUserPool resources
const { cfnUserPool } = backend.auth.resources.cfnResources
// update the schema property to add custom attributes
if (Array.isArray(cfnUserPool.schema)) {
	cfnUserPool.schema.push({
		name: 'tenantName',
		attributeDataType: 'String',
	})
}
