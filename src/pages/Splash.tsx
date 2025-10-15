import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import gif from '@/assets/construction.gif'

export default function Splash() {
	useEffect(() => {
		const timer = setTimeout(() => {
			const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
			const auth = raw ? JSON.parse(raw) : null
			const role = auth?.role
			if (role === 'superAdmin' || role === 'admin') {
				window.location.replace('/dashboard')
				return
			}
			if (role === 'user') {
				window.location.replace('/profile')
				return
			}
			window.location.replace('/')
		}, 4000)
		return () => clearTimeout(timer)
	}, [])

	const skip = () => {
		const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
		const auth = raw ? JSON.parse(raw) : null
		const role = auth?.role
		if (role === 'superAdmin' || role === 'admin') return (window.location.href = '/dashboard')
		if (role === 'user') return (window.location.href = '/profile')
		window.location.href = '/'
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-primary-hover text-primary-foreground relative overflow-hidden">
			<div className="absolute inset-0 opacity-20 pointer-events-none">
				<div className="absolute -top-20 -left-10 w-80 h-80 rounded-full bg-accent blur-3xl" />
				<div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-accent/60 blur-3xl" />
			</div>
			<div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
				<img src={gif} alt="loading" className="h-28 w-28 rounded-lg shadow-lg ring-2 ring-white/40 object-cover" />
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Préparation de votre espace...</h1>
					<p className="text-sm/relaxed text-white/80 mt-2">Merci de patienter quelques secondes pendant que nous configurons votre tableau de bord.</p>
				</div>
				<Button onClick={skip} variant="ghost" className="text-primary-foreground hover:bg-white/10">Passer</Button>
			</div>
		</div>
	)
} 