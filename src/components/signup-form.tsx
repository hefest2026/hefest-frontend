import { Link } from "react-router-dom";
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
import { cn } from "@/lib/utils";

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Регистрирайте се</CardTitle>
					<Field>
						<div className="grid grid-cols-2 gap-2">
							<Button variant="secondary" type="button" className="">
								<svg
									aria-label="Microsoft logo"
									role="img"
									width="800px"
									height="800px"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 4H11.5V11.5H4V4ZM12.5 4H20V11.5H12.5V4ZM4 12.5H11.5V20H4V12.5ZM12.5 12.5H20V20H12.5V12.5Z"
										fill="#000000"
									/>
								</svg>
							</Button>
							<Button variant="secondary" type="button">
								<svg
									aria-label="Google logo"
									role="img"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="800px"
									height="800px"
								>
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
							</Button>
						</div>
					</Field>
					<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
						или
					</FieldSeparator>
					<CardDescription>
						Попълнете информацията по-долу, за да създадете акаунт
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Двете имена</FieldLabel>
								<Input id="name" type="text" placeholder="John Doe" required />
							</Field>
							<Field>
								<FieldLabel htmlFor="class">Клас</FieldLabel>
								<Input id="class" type="text" placeholder="10A" required />
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Имейл</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</Field>
							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Парола</FieldLabel>
										<Input id="password" type="password" required />
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">
											Потвърждение на паролата
										</FieldLabel>
										<Input id="confirm-password" type="password" required />
									</Field>
								</Field>
								<FieldDescription>
									Паролата трябва да състои от поне 8 символа.
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit">Създай акаунта</Button>
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
