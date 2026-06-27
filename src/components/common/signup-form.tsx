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
import { useRegisterStudent } from "@/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";
import { OAuthButtons } from "./oauth-buttons";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Моля, въведете валидно име"),
    email: z.email("Невалиден имейл адрес"),
    password: z.string().min(12, "Паролата трябва да е поне 12 символа"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: registerStudent, isPending, error } = useRegisterStudent();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = ({
    confirmPassword: _confirmPassword,
    ...apiData
  }: RegisterFormValues) => {
    registerStudent(apiData);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Регистрирайте се</CardTitle>
          <OAuthButtons
            labelPrefix="Регистрация с"
            className="grid grid-cols-2 gap-2"
          />
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            или
          </FieldSeparator>
          <CardDescription>
            Попълнете информацията по-долу, за да създадете акаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="full_name">Двете имена</FieldLabel>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </Field>
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
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Парола</FieldLabel>
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
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Потвърждение на паролата
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </Field>
                </Field>
                {!errors.password && !errors.confirmPassword && (
                  <FieldDescription>
                    Паролата трябва да състои от поне 12 символа.
                  </FieldDescription>
                )}
                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {getApiErrorMessage(
                      error,
                      "Възникна грешка при регистрацията.",
                    )}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Регистриране..." : "Създай акаунта"}
                </Button>
                <FieldDescription className="text-center">
                  Вече имате акаунт? <Link to="/hefest-frontend">Влезте</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Със създаването на акаунта, Вие се съгласявате с нашите{" "}
        <Link to="/hefest-frontend/terms">Условията за ползване</Link> и{" "}
        <Link to="/hefest-frontend/privacy">Политиката за поверителност</Link>.
      </FieldDescription>
    </div>
  );
}
