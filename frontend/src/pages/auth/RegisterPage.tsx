import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { useAuth } from "@/contexts/AuthContext";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/auth/register.schema";
import { ROUTES } from "@/routes/paths";
import { getAuthErrorMessage } from "@/utils/auth-errors";

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);

    try {
      await registerAccount(values);
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1 pb-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-muted-foreground">
            Register as a team member to submit weekly reports.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="firstName"
              label="First name"
              error={errors.firstName?.message}
            >
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                className={formInputClassName(Boolean(errors.firstName))}
                aria-invalid={Boolean(errors.firstName)}
                disabled={isSubmitting}
                {...register("firstName")}
              />
            </FormField>

            <FormField
              id="lastName"
              label="Last name"
              error={errors.lastName?.message}
            >
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                className={formInputClassName(Boolean(errors.lastName))}
                aria-invalid={Boolean(errors.lastName)}
                disabled={isSubmitting}
                {...register("lastName")}
              />
            </FormField>
          </div>

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

          <FormField
            id="password"
            label="Password"
            error={errors.password?.message}
          >
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="pt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={ROUTES.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
