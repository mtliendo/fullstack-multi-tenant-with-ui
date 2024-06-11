import { Authenticator } from '@aws-amplify/ui-react'

import { Outlet } from 'react-router-dom'

export default function ProtectedLayout() {
	return (
		<Authenticator className="h-full flex items-center">
			<Outlet />
		</Authenticator>
	)
}
