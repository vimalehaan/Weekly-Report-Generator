import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { useAuth } from "@/contexts/AuthContext";
import {
  loginSchema,
  type LoginFormValues,
} from "@/schemas/auth/login.schema";
import { ROUTES } from "@/routes/paths";
import { getAuthErrorMessage } from "@/utils/auth-errors";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? ROUTES.home;

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await login(values);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1 pb-6">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Access your weekly reports and team dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField id="email" label="Email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={formInputClassName(Boolean(errors.email))}
              aria-invalid={Boolean(errors.email)}
              disabled={isSubmitting}
              {...register("email")}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={formInputClassName(Boolean(errors.password))}
              aria-invalid={Boolean(errors.password)}
              disabled={isSubmitting}
              {...register("password")}
            />
          </FormField>

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="pt-6 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link
            to={ROUTES.register}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
