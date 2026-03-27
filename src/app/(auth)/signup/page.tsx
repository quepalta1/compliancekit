"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signup,
    null,
  );

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start your NIS2 compliance journey today
        </p>
      </div>

      {state && "error" in state && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Create a password"
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters, one uppercase letter, and one number
          </p>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0369A1] text-white hover:bg-[#0369A1]/90"
        >
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0369A1] hover:text-[#0369A1]/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
