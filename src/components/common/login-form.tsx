import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as z from "zod";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth-mutations";
import { useProviders } from "@/hooks/use-providers";
import { cn } from "@/lib/utils";
import { OAuthButtons } from "./oauth-buttons";

const loginSchema = z.object({
  email: z.email("Невалиден имейл адрес"),
  password: z.string().min(1, "Полето е задължително"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: login, isPending, error } = useLogin();
  const { data: providers } = useProviders();
  const hasOAuth =
    (providers?.providers.filter((p) => p.available && p.login_url).length ??
      0) > 0;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Влезте в акаунта си</CardTitle>
          {hasOAuth && (
            <CardDescription>
              Влезте с Google или Microsoft акаунта
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {hasOAuth && (
                <>
                  <OAuthButtons
                    labelPrefix="Влезте с"
                    className="flex flex-col gap-2"
                  />
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Или продължете с имейл адреса си
                  </FieldSeparator>
                </>
              )}
              <Field>
                <FieldLabel htmlFor="email">Имейл</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Парола</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Забравена парола?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              {error && (
                <p className="text-sm font-medium text-destructive">
                  {getApiErrorMessage(error, "Невалиден имейл или парола.")}
                </p>
              )}
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Влизане..." : "Влезте"}
                </Button>
                <FieldDescription className="text-center">
                  Нямате акаунт?{" "}
                  <Link to="/hefest-frontend/signup">Регистрирайте се</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Продължавайки, се съгласявате с{" "}
        <Link to="/hefest-frontend/terms">Условията за ползване</Link> и{" "}
        <Link to="/hefest-frontend/privacy">Политиката за поверителност</Link>.
      </FieldDescription>
    </div>
  );
}
