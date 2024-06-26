import { useLoaderData } from 'react-router-dom'

const ProtectedPage = () => {
	const { tenantName } = useLoaderData() as { tenantName: string }

	console.log('ProtectedLayout data for tenant', tenantName)
	return <div>Hello, {tenantName}</div>
}

export default ProtectedPage
