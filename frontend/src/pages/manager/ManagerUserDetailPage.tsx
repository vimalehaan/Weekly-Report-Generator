import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { DeactivateUserConfirm } from "@/components/users/DeactivateUserConfirm";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isApiError } from "@/services/api";
import { getUserById, updateUser } from "@/services/users";
import { ROUTES } from "@/routes/paths";
import {
  updateUserFormSchema,
  type UpdateUserFormValues,
} from "@/schemas/user/update-user.schema";
import type { ManagedUser } from "@/types/user";
import { getApiErrorMessage } from "@/utils/api-errors";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatRoleLabel, formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "not-found" | "forbidden" | "error";

export function ManagerUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const [managedUser, setManagedUser] = useState<ManagedUser | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const loadUser = useCallback(async () => {
    if (!userId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setLoadError(null);

    try {
      const data = await getUserById(userId);
      setManagedUser(data);
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setLoadState("success");
    } catch (error) {
      if (isApiError(error)) {
        if (error.status === 404) {
          setLoadState("not-found");
          return;
        }

        if (error.status === 403) {
          setLoadState("forbidden");
          return;
        }
      }

      setLoadError(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [userId, reset]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  async function onSaveProfile(values: UpdateUserFormValues) {
    if (!userId || !managedUser) {
      return;
    }

    setSaveError(null);
    setSuccessMessage(null);

    const payload: UpdateUserFormValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };

    if (
      payload.firstName === managedUser.firstName &&
      payload.lastName === managedUser.lastName
    ) {
      setSaveError("No changes to save.");
      return;
    }

    try {
      const updated = await updateUser(userId, payload);
      setManagedUser(updated);
      reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      if (isApiError(error) && error.status === 422) {
        setSaveError(error.message);
      } else {
        setSaveError(getApiErrorMessage(error));
      }
    }
  }

  async function handleActivate() {
    if (!userId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateUser(userId, { isActive: true });
      setManagedUser(updated);
      setSuccessMessage("Account activated.");
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!userId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateUser(userId, { isActive: false });
      setManagedUser(updated);
      setShowDeactivateConfirm(false);
      setSuccessMessage("Account deactivated.");
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading user…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">User not found</h1>
        <p className="text-sm text-muted-foreground">
          This account does not exist or you do not have access to it.
        </p>
        <Link
          to={ROUTES.manager.users}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to users
        </Link>
      </section>
    );
  }

  if (loadState === "forbidden") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage this user.
        </p>
        <Link
          to={ROUTES.manager.users}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to users
        </Link>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load user
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadUser();
            }}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!managedUser) {
    return null;
  }

  const displayName = formatUserDisplayName(managedUser);
  const isSelf = currentUser?.id === managedUser.id;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to={ROUTES.manager.users}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to users
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <UserRoleBadge role={managedUser.role} />
              <UserStatusBadge isActive={managedUser.isActive} />
            </div>
            <p className="text-sm text-muted-foreground">{managedUser.email}</p>
            <p className="text-xs text-muted-foreground">
              Created {formatReportTimestamp(managedUser.createdAt)} · Updated{" "}
              {formatReportTimestamp(managedUser.updatedAt)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {managedUser.isActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                disabled={statusUpdating || isSelf}
                onClick={() => {
                  setStatusError(null);
                  setShowDeactivateConfirm(true);
                }}
              >
                Deactivate account
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={statusUpdating}
                onClick={() => {
                  void handleActivate();
                }}
              >
                {statusUpdating ? "Activating…" : "Activate account"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isSelf ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          You cannot deactivate your own account from this screen.
        </p>
      ) : null}

      {successMessage ? (
        <p
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-950 dark:text-emerald-100"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      {statusError ? (
        <p className="text-sm text-destructive" role="alert">
          {statusError}
        </p>
      ) : null}

      {showDeactivateConfirm ? (
        <DeactivateUserConfirm
          userName={displayName}
          isSubmitting={statusUpdating}
          errorMessage={statusError}
          onConfirm={() => {
            void handleConfirmDeactivate();
          }}
          onCancel={() => {
            if (!statusUpdating) {
              setShowDeactivateConfirm(false);
              setStatusError(null);
            }
          }}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-lg border border-border bg-card p-4"
          onSubmit={handleSubmit(onSaveProfile)}
          noValidate
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Profile details
            </h2>
            <p className="text-sm text-muted-foreground">
              Update the user&apos;s display name. Email and role are read-only.
            </p>
          </div>

          <FormField
            id="user-first-name"
            label="First name"
            error={errors.firstName?.message}
          >
            <input
              id="user-first-name"
              type="text"
              className={formInputClassName(Boolean(errors.firstName))}
              {...register("firstName")}
            />
          </FormField>

          <FormField
            id="user-last-name"
            label="Last name"
            error={errors.lastName?.message}
          >
            <input
              id="user-last-name"
              type="text"
              className={formInputClassName(Boolean(errors.lastName))}
              {...register("lastName")}
            />
          </FormField>

          <FormField id="user-email-readonly" label="Email">
            <input
              id="user-email-readonly"
              type="email"
              readOnly
              disabled
              value={managedUser.email}
              className={formInputClassName(false)}
            />
          </FormField>

          <FormField id="user-role-readonly" label="Role">
            <input
              id="user-role-readonly"
              type="text"
              readOnly
              disabled
              value={formatRoleLabel(managedUser.role)}
              className={formInputClassName(false)}
            />
          </FormField>

          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-base font-semibold text-foreground">
            Account summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <UserStatusBadge isActive={managedUser.isActive} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <UserRoleBadge role={managedUser.role} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="max-w-[60%] truncate font-mono text-xs text-foreground">
                {managedUser.id}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}
