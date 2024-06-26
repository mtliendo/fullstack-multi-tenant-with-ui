import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedLayout from './layouts/ProtectedLayout'
import HomePage from './pages/HomePage'
import ProtectedPage from './pages/ProtectedPage'
import { Authenticator } from '@aws-amplify/ui-react'
import { fetchUserAttributes } from 'aws-amplify/auth'
import LoginPage from './pages/LoginPage'

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				path: '/',
				element: <HomePage />,
			},
			{
				element: <ProtectedLayout />,
				errorElement: <div>oops, something went wrong</div>,

				children: [
					{
						path: '/login',
						element: <LoginPage />,
					},
					{
						path: '/protected',

						loader: async () => {
							const attrs = await fetchUserAttributes()
							const tenantName = attrs['custom:tenantName']
							console.log({ tenantName })
							return redirect(`/${tenantName}/protected`)
						},
					},
					{
						path: '/:tenantId/protected',
						element: <ProtectedPage />,
						loader: async ({ request }) => {
							let attrs
							const url = new URL(request.url)
							console.log('the url', url)
							const tenantNameInURL = url.pathname.split('/')[1]
							try {
								attrs = await fetchUserAttributes()
								const tenantName = attrs['custom:tenantName']
								if (tenantNameInURL !== tenantName) {
									throw new Error('Tenant name mismatch')
								}

								return { tenantName }
							} catch (e) {
								console.log(e)
								return redirect(`/login`)
							}
						},
					},
				],
			},
		],
	},
])

function App() {
	return (
		<Authenticator.Provider>
			<RouterProvider router={router} />
		</Authenticator.Provider>
	)
}

export default App
