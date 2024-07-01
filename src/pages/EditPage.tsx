import { useLoaderData } from 'react-router-dom'
import { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/api'

const client = generateClient<Schema>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loader = async ({ params }: { params: any }) => {
	const { data } = await client.queries.getTodo({
		id: params.todoId!,
	})
	return { todo: data }
}
const EditPage = () => {
	const { todo } = useLoaderData() as { todo: Schema['TodoResponse']['type'] }
	console.log('the todo', todo)
	return <div>EditPage</div>
}

export default EditPage
