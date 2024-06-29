import { defineFunction } from '@aws-amplify/backend'

export const postConfirmation = defineFunction({
	name: 'tenancyPostconfirmation',
	entry: './main.ts',
	runtime: 20,
})
