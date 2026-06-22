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
