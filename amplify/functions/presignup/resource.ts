import { defineFunction } from '@aws-amplify/backend'

export const preSignUp = defineFunction({
	name: 'tenancyPresignup',
	entry: './main.ts',
	runtime: 20,
})
