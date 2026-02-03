'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { login } from './action'

function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={pending}
        >
            {pending ? "Signing in..." : "Sign in"}
        </button>
    )
}

interface State {
    message: string;
    error: string;
    success?: boolean;
}

const initialState: State = {
    message: '',
    error: ''
}

export default function LoginPage(): JSX.Element {
    const router = useRouter()
    const [state, formAction] = useFormState(async (prevState: State, formData: FormData) => {
        const result = await login(prevState, formData)
        if (result.success) {
            router.push('/dashboard')
            return { ...result, error: '' }
        }
        return result
    }, initialState)

    return (
        <div className="bg-black flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
                    className="mx-auto h-44 w-auto"
                    src="/M.png"
                    alt="logo"
                />
                <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" action={formAction}>
                    {state?.error && (
                        <div className="text-red-500 text-sm text-center" role="alert">
                            {state.error}
                        </div>
                    )}
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium leading-6 text-white"
                        >
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border-0 pl-3 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                aria-describedby={state?.error ? "login-error" : undefined}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium leading-6 text-white"
                            >
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md pl-3 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                aria-describedby={state?.error ? "login-error" : undefined}
                            />
                        </div>
                    </div>

                    <div>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    )
}