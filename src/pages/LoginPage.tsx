import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
	const navigate = useNavigate()
	useEffect(() => {
		navigate('/todos')
	}, [navigate])
	return <div>redirecting...</div>
}

export default LoginPage
