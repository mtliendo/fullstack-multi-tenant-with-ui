import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedLayout from './layouts/ProtectedLayout'
import HomePage from './pages/HomePage'
import ProtectedPage from './pages/ProtectedPage'
import { Authenticator } from '@aws-amplify/ui-react'

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
				path: 'protected',
				children: [
					{
						path: '/protected',
						element: <ProtectedPage />,
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
