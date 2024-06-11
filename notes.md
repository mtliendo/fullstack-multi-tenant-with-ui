# How I rapidly create apps as a DA in 2024

## Application Setup

### Configure the frontend

1. Vite: `npm create vite`
1. Install React Router: `npm i react-router-dom`
1. Install Tailwind DaisyUI:

```sh
npm install -D tailwindcss postcss autoprefixer daisyui
npx tailwindcss init -p
```

```ts
//tailwind.config.ts
import daisyui from 'daisyui'
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [daisyui],
}
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Configure the backend

1. Scaffold Amplify: `npm create amplify`
1. Install UI lib to interact with backend: `npm i @aws-amplify/ui-react`

## Application Configuration

Every app I create has a landing page that I use to display information about the project I'm building. At a minimum, this includes a [navbar](https://daisyui.com/components/navbar/), [hero](https://daisyui.com/components/hero/), and [footer](https://daisyui.com/components/footer/). The components live in a `components` directory.

### Routing

I always have at least a public landing page (the homepage), and a page that require Authentication. Though the app should be flexible enough to account for more/nested pages.

I update the navbar to contain routing links.

#### HomePage

Every page will have a navbar and footer so I can keep the Home page simple:

```tsx
import Hero from '../components/Hero'

const HomePage = () => {
	return <Hero />
}

export default HomePage
```

#### Other Pages

```tsx
//the signin page
```

```tsx
//the signup page
```

#### Protected Page

```tsx
const Protected = () => {
	return <div>Protected</div>
}

export default Protected
```

### Create Layouts

Here I will have one root layout that has my navbar and footer. I will also have another that is nested in the general layout. This one manages auth and simply returns the item if authenticated or redirects to a signup page.

#### Root Layout

```tsx
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function RootLayout() {
	return (
		<>
			<header className="header">
				<Navbar />
			</header>
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	)
}
```

#### Protected Layout

```tsx
//protected
```

### Setup React Router Dom

```tsx
//app.css is deleted
// app.tsx
```
