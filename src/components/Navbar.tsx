import { useAuthenticator } from '@aws-amplify/ui-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
	const { user, signOut } = useAuthenticator((context) => [context.user])
	return (
		<div className="navbar bg-primary text-primary-content">
			<div className="flex-1">
				<Link to="/" className="btn btn-ghost text-xl">
					Focus Otter
				</Link>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					{user ? (
						<li>
							<button onClick={signOut}>Log out</button>
						</li>
					) : (
						<li>
							<Link to="/login">Log in</Link>
						</li>
					)}
				</ul>
			</div>
		</div>
	)
}

export default Navbar
