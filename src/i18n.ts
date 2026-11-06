export type Language = "ru" | "en";

// Russian source phrases are stable keys. Track titles and artist names are never translated.
export const english: Record<string, string> = {
  ", фон прозрачный. Размер виджета задаётся в редакторе.":
    ", transparent background. Set the widget size in the editor.",
  ". Кнопка в скрипте создаст источник в текущей сцене.":
    ". Use its button to add the widget to the current scene.",
  "CD-диск": "CD disc",
  "CD-плеер": "CD player",
  "URL источника OBS": "OBS source URL",
  "px · автоматическая высота": "px · auto height",
  "px/с": "px/s",
  Автовыбор: "Auto-select",
  "Автовыбор источника": "Automatic source selection",
  "Адрес оверлея": "Overlay URL",
  "Бегущая строка": "Scrolling text",
  "Без названия": "Untitled",
  "В OBS выберите «Сервис → Скрипты → +» и добавьте":
    "In OBS, go to Tools → Scripts → + and add",
  "Ваша музыка — в OBS": "Your music. On stream.",
  Вертикальный: "Stacked",
  "Включается только для длинного текста":
    "Only scrolls when the text overflows",
  "Включите музыку и выберите источник": "Play some music and choose a source",
  "Включите музыку или подключите вкладку":
    "Play some music or connect a browser tab",
  "Включите плеер с поддержкой медиасессий Windows или подключите вкладку расширением.":
    "Start a player that supports Windows media sessions, or connect a tab with the extension.",
  "Внутренний отступ": "Padding",
  "Воспроизвести демо": "Play demo",
  Воспроизводится: "Playing",
  "Вращение диска": "Spin the disc",
  "Время трека": "Track time",
  "Все изменения сохранены": "All changes saved",
  "Всё в ваших руках": "Make it your own",
  "Выберите все приложения автоматически или закрепите один источник. Данные обновляются каждую секунду.":
    "Automatically follow a playing app, or pin one source. Metadata updates every second.",
  "Готово к вашему эфиру": "Ready for your stream",
  "ДЕМО · НЕ ПОПАДАЕТ В OBS": "DEMO · EDITOR ONLY",
  "Движение и поведение": "Motion & behavior",
  "Демо-трек": "Demo track",
  "Демо-трек виден только в редакторе. В эфир поступает выбранный реальный источник. Этот виджет показывает метаданные; звук добавляется в OBS отдельно.":
    "The demo track only appears in the editor. OBS receives your selected real source. This widget displays metadata; add your audio source separately in OBS.",
  "Для панели внутри OBS: «Док-панели → Пользовательские док-панели браузера», адрес":
    "For an editor dock inside OBS: Docks → Custom Browser Docks, URL",
  "Добавьте адрес как источник «Браузер» в OBS.":
    "Add this URL as a Browser Source in OBS.",
  "Если источник недоступен": "When the source is unavailable",
  "Ждём вашу музыку": "Waiting for your music",
  "Заголовок окна": "Window title bar",
  "Заголовок ретроокна": "Retro window title bar",
  "Закреплённый источник недоступен": "Pinned source is unavailable",
  "Закрыть инструкцию": "Close setup guide",
  "Захват звука сам по себе не содержит названия и обложки. Для нестандартного плеера доступен локальный API — описание в README.":
    "Audio capture alone does not include titles or artwork. A local API is available for custom players; see the README.",
  "Здесь появится ваш трек": "Your track goes here",
  "ИСТОЧНИК МУЗЫКИ": "MUSIC SOURCE",
  Изменить: "Change",
  "Или добавьте источник «Браузер» вручную с адресом ниже. Размер:":
    "Or add a Browser Source manually using the URL below. Source size:",
  "Импортировать пресет": "Import preset",
  Инструкция: "Setup guide",
  "Информация о треке": "Track information",
  Исполнитель: "Artist",
  "Исполнитель и время": "Artist & time",
  "Исполнитель не указан": "Unknown artist",
  Источники: "Sources",
  "Источники музыки": "Music sources",
  "Как подключить": "Setup guide",
  Классика: "Classic",
  Компоновка: "Layout",
  "Конкретная вкладка": "One specific tab",
  "Копировать URL": "Copy URL",
  "Копировать адрес": "Copy URL",
  "Копировать ключ подключения": "Copy pairing key",
  "Локально. Без аккаунтов. Без подписок.":
    "Local. No accounts. No subscriptions.",
  "Локальный сервис": "Local service",
  "МУЗЫКА НА СТРИМЕ": "YOUR STREAM SOUNDTRACK",
  "Масштаб до": "Scale up to",
  "Масштаб предпросмотра": "Preview scale",
  Минимализм: "Minimal",
  "Музыка в вашем стиле": "Your music. Your style.",
  "Музыкальный виджет": "Music widget",
  Мята: "Mint",
  Мятная: "Mint theme",
  "НА ПАУЗЕ": "PAUSED",
  "НА СТРИМ ЗА МИНУТУ": "LET THE MUSIC IN",
  "На паузе": "Paused",
  "Название трека": "Track title",
  "Настройки виджета": "Widget settings",
  "Начните с готового варианта": "Pick a starting point",
  "Не сохранено · повторяем": "Not saved · retrying",
  "Не удалось импортировать:": "Could not import:",
  "Не удалось скопировать. Выделите адрес вручную.":
    "Could not copy. Select the URL and copy it manually.",
  "Немного ностальгии в каждом треке.": "A little nostalgia in every track.",
  Непрозрачность: "Opacity",
  "Нет подключения": "Disconnected",
  "Нет связи с локальным сервисом. Запустите Start RETROTUNE.cmd.":
    "Cannot reach the local service. Run Start RETROTUNE.cmd.",
  Ночная: "Night theme",
  Ночь: "Night",
  "ОЖИДАНИЕ МУЗЫКИ": "WAITING FOR MUSIC",
  Облака: "Cloud",
  Облачная: "Cloud theme",
  "Обложка + информация": "Cover + track details",
  "Обложка альбома": "Album artwork",
  "Обложка и диск": "Cover + disc",
  "Обложка сверху": "Artwork on top",
  "Обложка трека": "Track artwork",
  "Оставьте локальный сервис RETROTUNE запущенным.":
    "Keep the RETROTUNE local service running.",
  "Останавливается вместе с музыкой": "Stops when the music pauses",
  "Открыть оверлей": "Open overlay",
  Оформление: "Style",
  "Оформление импортировано": "Preset imported",
  "Оформление сброшено": "Appearance reset",
  "ПРОЗРАЧНЫЙ ФОН ДЛЯ OBS": "TRANSPARENT BACKGROUND FOR OBS",
  "Пауза демо": "Pause demo",
  "Первый воспроизводящийся источник": "Follow the first playing source",
  "Подключение к OBS": "Connect to OBS",
  "Подключение к Windows…": "Connecting to Windows…",
  "Подключение…": "Connecting…",
  "Подключить к OBS": "Connect to OBS",
  "Показывать ожидание": "Show a waiting message",
  "Получение музыки": "Choose your music",
  Понятно: "Got it",
  "Порядок блоков слева направо; в вертикальном виде — сверху вниз.":
    "Blocks run left to right, or top to bottom in the stacked layout.",
  "После перезагрузки страницы подключите вкладку заново. Ключ хранится локально и не нужен в URL оверлея.":
    "Reconnect the tab after reloading its page. Your key stays local and is never needed in the overlay URL.",
  Предпросмотр: "Preview",
  "Приложения и вкладки": "Apps & browser tabs",
  Прогресс: "Progress",
  "Прогресс трека": "Track progress",
  "Прогресс-бар": "Progress bar",
  "Прозрачный фон": "Transparent background",
  "РАБОЧЕЕ ПРОСТРАНСТВО": "WORKSPACE",
  "Рабочее пространство": "Workspace",
  "Размер названия": "Title size",
  "Размер обложки": "Artwork size",
  "Размеры и форма": "Size & shape",
  Рамка: "Border",
  Расположение: "Block order",
  "Расстояние между блоками": "Block spacing",
  "Редактор виджета": "Widget editor",
  Розовая: "Rose theme",
  "СЕЙЧАС ИГРАЕТ": "NOW PLAYING",
  Сакура: "Sakura",
  "Сбросить оформление": "Reset appearance",
  "Свой вариант": "Custom",
  "Сервис недоступен": "Service unavailable",
  "Синий фон": "Blue background",
  "Скопировано в буфер обмена": "Copied to clipboard",
  "Скорость строки": "Scroll speed",
  "Скругление обложки": "Artwork corners",
  "Скругление окна": "Window corners",
  "Скрывать виджет в OBS": "Hide the widget in OBS",
  "Скрывать на паузе": "Hide when paused",
  "Соберите свой виджет. Добавьте в OBS. Включайте музыку.":
    "Build your widget. Drop it into OBS. Press play.",
  "Сохранение…": "Saving…",
  "Статус воспроизведения": "Playback status",
  "Только главное": "Just the essentials",
  "Тёмный фон": "Dark background",
  "Установите расширение из папки": "Load the unpacked extension from",
  "Фон виджета": "Widget background",
  "Цветовая тема": "Widget color theme",
  "Что показывать": "Visible elements",
  "Ширина виджета": "Widget width",
  "Экспорт пресета": "Export preset",
  Элементы: "Elements",
  "через «Загрузить распакованное» на странице расширений Chrome/Edge. В его окне вставьте ключ и нажмите «Подключить эту вкладку».":
    "on your Chrome/Edge extensions page. Paste the pairing key into its popup and choose “Connect this tab”.",
  "♫ Хорошая музыка заслуживает красивого места.":
    "♫ Good music deserves a place on your stream.",
  "Переместить обложку": "Move artwork block",
  "Переместить информацию": "Move information block",
  "Язык интерфейса": "Interface language",
  "Светлая тема редактора": "Light editor theme",
  "Тёмная тема редактора": "Dark editor theme",
  "Тема редактора": "Editor theme",
  Тёмная: "Dark",
  Светлая: "Light",
  "Windows подключена": "Windows connected",
  "Windows подключена · нет медиасессий":
    "Windows connected · no media sessions",
  "Windows недоступна": "Windows unavailable",
  "Ожидается объект настроек": "Expected a settings object",
  "Неизвестная настройка:": "Unknown setting:",
  "Неверное значение:": "Invalid value:",
  "Значение вне диапазона:": "Value out of range:",
  "Ожидается HEX-цвет:": "Expected a HEX color:",
  "Ожидается переключатель:": "Expected a boolean:",
  "Неверный источник": "Invalid source",
  "Неверный порядок блоков": "Invalid block order",
  "Неверный ключ подключения": "Invalid pairing key",
  "Ожидается объект трека": "Expected a track object",
  "Неверное поле:": "Invalid field:",
  "Используйте собственный id источника": "Use a custom source ID",
  "Обложка: HTTPS или PNG/JPEG/WebP data URL":
    "Artwork must be HTTPS or a PNG/JPEG/WebP data URL",
  "Неверное время или скорость:": "Invalid time or playback rate:",
  "playing должен быть boolean": "playing must be a boolean",
  "Достигнут лимит 64 источников": "The 64-source limit has been reached",
  "RETROTUNE — музыка на стриме": "RETROTUNE — your stream soundtrack",
};

export function createTranslator(language: Language = "ru") {
  return (input: string): string => {
    if (language !== "en" || !input) return input;
    const trimmed = input.trim();
    const exact = english[trimmed];
    if (exact) return input.replace(trimmed, exact);
    if (input.startsWith("Error: "))
      return "Error: " + createTranslator(language)(input.slice(7));
    for (const [key, value] of Object.entries(english))
      if (key.endsWith(":") && trimmed.startsWith(key))
        return value + trimmed.slice(key.length);
    if (input.includes(" · "))
      return input.split(" · ").map(createTranslator(language)).join(" · ");
    return input;
  };
}
