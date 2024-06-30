import { Authenticator, Input, Label } from '@aws-amplify/ui-react'
import { I18n } from 'aws-amplify/utils'

I18n.putVocabulariesForLanguage('en', {
	'Create Account': 'Register New Tenant',
})

import { Outlet } from 'react-router-dom'

export default function ProtectedLayout() {
	return (
		<Authenticator
			className="h-full flex items-center"
			components={{
				SignUp: {
					FormFields() {
						return (
							<>
								{/* Re-use default `Authenticator.SignUp.FormFields` */}
								<Authenticator.SignUp.FormFields />

								<Label>
									Tenant Name
									<Input
										name="custom:tenantName"
										isRequired
										placeholder="Your Tenant Name"
									/>
								</Label>
							</>
						)
					},
				},
			}}
		>
			<Outlet />
		</Authenticator>
	)
}
