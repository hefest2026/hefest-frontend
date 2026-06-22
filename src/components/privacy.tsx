import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl md:text-4xl text-primary">Политика за поверителност</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Какви данни събираме</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Събираме информация, която ни помага да предоставяме услугите си, включително данни за контакт, имейл, профилна информация и технически данни от устройството.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
							<li>Данни, които въвеждате при регистрация и профилни настройки.</li>
							<li>Информация за използването на приложението и предпочитания.</li>
							<li>Технически метаданни като IP адрес и тип устройство.</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">За какво използваме данните</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Използваме лична информация за поддръжка на акаунти, подобряване на услугата и осигуряване на по-добро и по-сигурно потребителско изживяване.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
							<li>Управление и защита на вашия акаунт.</li>
							<li>Анализ и оптимизация на функционалностите.</li>
							<li>Изпращане на важни уведомления и сервизни съобщения.</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Как защитаваме информацията</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Прилагаме технически и организационни мерки за защита на личните данни срещу неоторизиран достъп, промени и загуба.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Вашите права</h2>
						<p className="max-w-3xl text-sm text-muted-foreground">
							Имате право да поискате достъп, корекция, изтриване или ограничаване на обработката на личните си данни, както и да оттеглите съгласието си, ако то е основа за обработка.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
							<li>Достъп до информацията, която държим за вас.</li>
							<li>Корекция на неточни данни.</li>
							<li>Искане за изтриване или ограничаване на обработката.</li>
						</ul>
					</section>
				</CardContent>
			</Card>
		</div>
	);
}
