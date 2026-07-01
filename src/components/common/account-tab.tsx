import { useMe } from "@/hooks/use-me";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABELS: Record<string, string> = {
  student: "Студент",
  organizer: "Организатор",
};

export const AccountTab = () => {
  const { data: me, isPending } = useMe();

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-xl font-medium text-gray-900">
        Редактиране на профила
      </h2>

      <div className="flex flex-col items-center gap-6 border border-border bg-card p-6 sm:flex-row">
        <div className="flex h-16 w-16 items-center justify-center bg-foreground text-xl font-semibold text-background">
          {isPending ? "…" : getInitials(me?.full_name ?? "")}
        </div>
        <div className="flex-1 text-center sm:text-left">
          {isPending ? (
            <p className="text-sm text-muted-foreground">Зареждане...</p>
          ) : (
            <>
              <h3 className="text-lg font-medium text-card-foreground">
                {me?.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">{me?.email}</p>
              {me?.role && (
                <span className="mt-2 inline-block border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {ROLE_LABELS[me.role] ?? me.role}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="border border-border bg-card p-6">
        <h4 className="mb-4 text-base font-medium text-card-foreground">
          Настройки
        </h4>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between border-b border-border py-2">
            <div>
              <p className="font-medium text-foreground">Имейл известия</p>
              <p className="text-xs text-muted-foreground">
                Получавайте отчети за записванията
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 border-border accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
