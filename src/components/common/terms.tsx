import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TermsAndConditions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl md:text-4xl text-primary">
						Общи условия за ползване
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Приемане на условията</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							С използването на приложението вие приемате тези общи условия и се
							съгласявате да спазвате правилата за поведение и ползване на
							услугата.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Регистрация и акаунт</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Някои функции изискват регистрация. Вие сте отговорни за
							сигурността на своите данни за вход и за актуалността на
							предоставената информация.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
							<li>Регистрирайте се с верни и актуални данни.</li>
							<li>Не споделяйте данните за достъп с трети лица.</li>
							<li>
								Администраторът може да деактивира акаунт при нарушение на
								условията.
							</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Ограничения и забрани</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Забранено е използване на услугата за дейности, които нарушават
							закона, правата на трети лица или добрите нрави.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
							<li>
								Не публикувайте спам, злонамерени материали или подвеждаща
								информация.
							</li>
							<li>Не опитвайте да заобикаляте мерки за сигурност.</li>
							<li>
								Не използвайте системата за неоторизирани търговски действия.
							</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Отговорности</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Администраторът се грижи за нормалната работа на услугата, но не
							носи отговорност за щети, произтичащи от неправилна употреба или
							технически прекъсвания.
						</p>
					</section>
				</CardContent>
			</Card>
		</div>
	);
}
