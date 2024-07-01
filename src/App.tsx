import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedLayout from './layouts/ProtectedLayout'
import HomePage from './pages/HomePage'
import TodosPage, {
	loader as todosLoader,
	action as createAction,
} from './pages/TodosPage'
import { Authenticator } from '@aws-amplify/ui-react'
import { fetchUserAttributes } from 'aws-amplify/auth'
import LoginPage from './pages/LoginPage'
import EditPage, { loader as editTodoLoader } from './pages/EditPage'
import CreatePage, { loader as createTodoLoader } from './pages/CreatePage'

//todo: refactor out the loaders and actions.✅
//todo: when a user clicks 'create" todo an action creates the item and redirects to the edit route /todos/:todoId/edit.
//todo: beforethey are taken to the `edit` route, a loader gets the full item with the todoId and uses this to populate the fields.
//todo: on submit of the form, the action updates the item and redirects to the `/todos` page.
//todo: on the edit button, if a user clicks a btn.button then a user is directed to the /destroy route, but this route has an action that deletesthe item and redirects to the /todos route. This route has no UI.
//todo: on the protectedlayout route, add a useEffect to subscribe to data by tenantId. The tenantId is captured as the cognito custom attribute.

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
						path: '/todos',

						loader: async () => {
							const attrs = await fetchUserAttributes()
							const tenantName = attrs['custom:tenantName']
							console.log({ tenantName })
							return redirect(`/${tenantName}/todos`)
						},
					},
					{
						path: '/:tenantId/todos',
						element: <TodosPage />,
						loader: todosLoader,
						action: createAction,
						children: [
							{
								path: 'edit',
								element: <EditPage />,
								loader: editTodoLoader,
							},
							{
								path: 'create',
								element: <CreatePage />,
								loader: createTodoLoader,
							},
						],
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
