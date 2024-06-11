import { Link } from 'react-router-dom'

const Hero = () => {
	return (
		<div className="hero min-h-screen bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-md">
					<h1 className="text-5xl font-bold">Hello there</h1>
					<p className="py-6">
						I'm a pretty basic hero element. That's ok. We all start somewhere!
						Hopefully you end up building something amazing 🦦
					</p>
					<Link to="/protected" className="btn btn-primary">
						Get Started
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Hero
