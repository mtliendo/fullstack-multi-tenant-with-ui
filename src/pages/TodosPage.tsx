import { Form, redirect, useLoaderData } from 'react-router-dom'
import { Schema } from '../../amplify/data/resource'
import { fetchUserAttributes } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/api'

const client = generateClient<Schema>()

export const loader = async ({ request }: { request: Request }) => {
	let attrs
	const url = new URL(request.url)
	const tenantNameInURL = url.pathname.split('/')[1]
	console.log('tenantNameInURL', tenantNameInURL)
	try {
		attrs = await fetchUserAttributes()
		const tenantName = attrs['custom:tenantName']
		if (tenantNameInURL !== tenantName) {
			throw new Error('Tenant name mismatch')
		}
		const { data } = await client.queries.listTodos(
			{},
			{ authMode: 'userPool' }
		)
		console.log('the data', data)
		return { tenantName, todoData: data }
	} catch (e) {
		console.log(e)
		return redirect(`/login`)
	}
}

export const action = async ({ request }: { request: Request }) => {
	const formData = await request.formData()
	const todoName = formData.get('todoName') as string
	console.log('todoName', todoName)
	const { data, errors } = await client.mutations.createTodo({ name: todoName })
	console.log('the errors', errors)
	console.log('the data', data)
	return redirect(`${data?.id}/edit`)
}

const TodosPage = () => {
	const { tenantName, todoData } = useLoaderData() as {
		tenantName: string
		todoData: Schema['ListTodosResponse']['type']
	}

	return (
		<>
			<h1 className=" mt-8 text-4xl text-center">
				Member of tenant: <span className="text-accent">{tenantName}</span>
			</h1>
			<div className="overflow-x-auto">
				{todoData.todos.length === 0 ? (
					<>
						<h2 className="text-center text-2xl mt-16">
							No todos. Great job 🎉
						</h2>
						<div className="flex justify-center mt-4">
							<Form method="POST">
								<input
									className="input input-primary"
									name="todoName"
									required
								/>
								<button className="btn btn-primary ml-4" type="submit">
									Create
								</button>
							</Form>
						</div>
					</>
				) : (
					<table className="table">
						{/* head */}
						<thead>
							<tr>
								<th></th>
								<th>Name</th>
								<th>Completed</th>
								<th>Created At</th>
							</tr>
						</thead>
						<tbody>
							{todoData.todos.map((todo, index) => {
								return (
									<tr key={todo?.id}>
										<th>{index + 1}</th>
										<td>{todo?.name}</td>
										<td>{todo?.completed ? 'Yes' : 'No'}</td>
										<td>{todo?.createdAt}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				)}
			</div>
		</>
	)
}

export default TodosPage
