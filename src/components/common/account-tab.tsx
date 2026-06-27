import { Button } from "@/components/ui/button"

export const AccountTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">
        Профил на организатора
      </h2>

      {/* User Info Card */}
      <div className="flex flex-col items-center gap-6 border border-gray-200 bg-white p-6 shadow-sm sm:flex-row">
        <div className="flex h-16 w-16 items-center justify-center bg-gray-900 text-xl font-semibold text-white">
          ИП
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-medium text-gray-900">Иван Петров</h3>
          <p className="text-sm text-gray-500">
            ivan.petrov@example.com · Член от 2024
          </p>
          <span className="mt-2 inline-block border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Проверен Организатор
          </span>
        </div>
        <Button variant="outline" size="sm">
          Редактиране
        </Button>
      </div>

      {/* Quick Stats Grid
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border border-gray-200 bg-white p-5 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {draftEvents.length}
                </div>
                <div className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Чернови събития
                </div>
              </div>
              <div className="border border-gray-200 bg-white p-5 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {publishedEvents.length}
                </div>
                <div className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Активни събития
                </div>
              </div>
              <div className="border border-gray-200 bg-white p-5 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {publishedEvents.reduce(
                    (acc, curr) => acc + curr.capacity,
                    0
                  )}
                </div>
                <div className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Общ капацитет
                </div>
              </div>
            </div> */}

      {/* Account Settings Placeholder */}
      <div className="border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-base font-medium text-gray-900">
          Настройки за сигурност
        </h4>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-center justify-between border-b border-gray-100 py-2">
            <div>
              <p className="font-medium text-gray-900">Парола</p>
              <p className="text-xs text-gray-500">
                Последно променена преди 3 месеца
              </p>
            </div>
            <Button variant="outline" size="sm">
              Промяна
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Имейл известия</p>
              <p className="text-xs text-gray-500">
                Получавайте отчети за записванията
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 border-gray-300 accent-black"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
