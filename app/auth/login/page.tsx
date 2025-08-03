"use client"

import { useActionState } from "react"
import { signIn } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"

export default function LoginPage() {
  // Define the initial state for the action
  const initialState = null // Or { success: false, message: '' } if you want a non-null initial state

  const [state, formAction, isPending] = useActionState(signIn, initialState)
  const { currentContent } = useLanguage()

  return (
    <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-purple">{currentContent.auth.login.title}</CardTitle>
          <CardDescription>{currentContent.auth.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{currentContent.auth.login.emailLabel}</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{currentContent.auth.login.passwordLabel}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.message && (
              <p className="text-sm text-red-500" role="alert">
                {state.message}
              </p>
            )}
            <Button type="submit" className="w-full bg-teal hover:bg-purple" disabled={isPending}>
              {isPending ? currentContent.auth.login.signingIn : currentContent.auth.login.signIn}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {currentContent.auth.login.noAccount}{" "}
            <Link href="#" className="underline" prefetch={false}>
              {currentContent.auth.login.signUp}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
