const field = document.querySelector("#token"),
  status = document.querySelector("#status");
const messages = {
  en: {
    intro: "This tab → your OBS music widget.",
    keyLabel: "Pairing key from Editor → Sources",
    key: "Pairing key",
    connect: "Connect this tab",
    disconnect: "Disconnect tab",
    hint: "Reconnect after reloading the page. Embedded iframe players are not supported.",
    editor: "Open editor ↗",
    local: "Your pairing key stays on this computer.",
    busy: "Connecting…",
    connected: "Tab connected. Choose it in the editor.",
    disconnected: "Tab disconnected.",
    error: "Could not connect. Start RETROTUNE and check the pairing key.",
    page: "Open a regular HTTP/HTTPS page with music.",
    invalid: "Invalid pairing key",
  },
  ru: {
    intro: "Эта вкладка → ваш музыкальный виджет в OBS.",
    keyLabel: "Ключ из редактора → Источники",
    key: "Ключ подключения",
    connect: "Подключить эту вкладку",
    disconnect: "Отключить вкладку",
    hint: "После перезагрузки страницы подключите её заново. Плееры в iframe не поддерживаются.",
    editor: "Открыть редактор ↗",
    local: "Ключ подключения остаётся на этом компьютере.",
    busy: "Подключение…",
    connected: "Вкладка подключена. Выберите её в редакторе.",
    disconnected: "Вкладка отключена.",
    error: "Не удалось подключиться. Запустите RETROTUNE и проверьте ключ.",
    page: "Откройте обычную HTTP/HTTPS страницу с музыкой.",
    invalid: "Неверный ключ подключения",
  },
};
let locale = (chrome.i18n.getUILanguage() || "en").startsWith("ru")
  ? "ru"
  : "en";
function render() {
  document.documentElement.lang = locale;
  for (const el of document.querySelectorAll("[data-key]"))
    el.textContent = messages[locale][el.dataset.key];
  field.setAttribute("aria-label", messages[locale].key);
}
render();
const ready = (async () => {
  const stored = await chrome.storage.local.get("token");
  field.value = stored.token || "";
  try {
    const state = await (
      await fetch("http://127.0.0.1:47832/api/state")
    ).json();
    locale = state.settings.language === "ru" ? "ru" : "en";
    render();
  } catch {}
})();
for (const action of ["connect", "disconnect"])
  document.querySelector("#" + action).onclick = async () => {
    await ready;
    status.textContent = messages[locale].busy;
    const button = document.querySelector("#" + action);
    button.disabled = true;
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const result = await chrome.runtime.sendMessage({
        type: action,
        tabId: tab.id,
        token: field.value.trim(),
      });
      if (result.error) throw Error(result.error);
      status.textContent =
        messages[locale][action === "connect" ? "connected" : "disconnected"];
    } catch (e) {
      status.textContent = e.message.includes("HTTP/HTTPS")
        ? messages[locale].page
        : /pairing key|ключ подключения/i.test(e.message)
          ? messages[locale].invalid
          : messages[locale].error;
    } finally {
      button.disabled = false;
    }
  };
