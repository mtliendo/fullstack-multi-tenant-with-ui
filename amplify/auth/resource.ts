import { defineAuth } from '@aws-amplify/backend'
import { preSignUp } from '../functions/presignup/resource'
import { postConfirmation } from '../functions/postconfirmation/resource'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */

export const auth = defineAuth({
	loginWith: {
		email: true,
	},
	groups: ['admin', 'user'],
	triggers: {
		preSignUp,
		postConfirmation,
	},
	access: (allow) => [allow.resource(postConfirmation).to(['addUserToGroup'])],
})
