"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    login,
    null,
  );

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your ComplianceKit account
        </p>
      </div>

      {state && "error" in state && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="text-xs font-medium text-[#0369A1] hover:text-[#0369A1]/80"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0369A1] text-white hover:bg-[#0369A1]/90"
        >
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#0369A1] hover:text-[#0369A1]/80"
          >
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
