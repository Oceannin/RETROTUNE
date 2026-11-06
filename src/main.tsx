import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioLines,
  Monitor,
  SlidersHorizontal,
  Shapes,
  Radio,
  Palette,
  LayoutTemplate,
  ArrowUpRight,
  Copy,
  Check,
  GripVertical,
  Music2,
  HelpCircle,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Play,
  Pause,
  Link2,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { Widget } from "./Widget";
import {
  defaults,
  demoTrack,
  themes,
  type Settings,
  type Track,
  type Bootstrap,
  type Snapshot,
} from "./model";
import "./styles.css";
import "./dark.css";
import { createTranslator } from "./i18n";

const url = location.origin + "/overlay";
const layouts = [
  {
    id: "classic",
    name: "Классика",
    desc: "Обложка + информация",
    icon: "▣ ━",
  },
  { id: "disc", name: "CD-плеер", desc: "Обложка и диск", icon: "▣ ◉" },
  { id: "minimal", name: "Минимализм", desc: "Только главное", icon: "━━" },
  { id: "vertical", name: "Вертикальный", desc: "Обложка сверху", icon: "▣" },
  { id: "custom", name: "Свой вариант", desc: "Всё в ваших руках", icon: "⊞" },
] as const;
function Btn({
  children,
  onClick,
  primary = false,
  ...rest
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={primary ? "button primary" : "button"}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
function Toggle({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
  return (
    <label className="toggle-row">
      <span>
        {label}
        {desc && <small>{desc}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch" />
    </label>
  );
}
function Range({
  label,
  value,
  min,
  max,
  onChange,
  suffix = "px",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="range-field">
      <span>
        {label}
        <output>
          {value} {suffix}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function PreviewRenderer({
  settings,
  track,
  zoom,
}: {
  settings: Settings;
  track: Track | null;
  zoom: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({
    width: 600,
    height: 250,
    widgetHeight: 180,
  });
  useEffect(() => {
    const measure = () => {
      if (host.current && content.current)
        setBox({
          width: host.current.clientWidth,
          height: host.current.clientHeight,
          widgetHeight: content.current.offsetHeight,
        });
    };
    const ro = new ResizeObserver(measure);
    if (host.current) ro.observe(host.current);
    if (content.current) ro.observe(content.current);
    measure();
    return () => ro.disconnect();
  }, []);
  const scale = Math.min(
    zoom / 100,
    (box.width - 20) / settings.width,
    (box.height - 16) / Math.max(1, box.widgetHeight),
  );
  return (
    <div className="preview-content" ref={host}>
      <div
        className="preview-fit"
        style={{
          width: settings.width * scale,
          height: box.widgetHeight * scale,
        }}
      >
        <div
          ref={content}
          style={{
            width: settings.width,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <Widget settings={settings} track={track} preview />
        </div>
      </div>
    </div>
  );
}
function Overlay() {
  const [state, setState] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    document.body.classList.add("overlay-page");
    document.documentElement.classList.add("overlay-page");
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/state");
        if (!r.ok) throw Error();
        const j = await r.json();
        if (alive) {
          setState(j);
          setConnected(true);
        }
      } catch {
        if (alive) setConnected(false);
      }
    };
    poll();
    const id = setInterval(poll, 500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return connected && state ? (
    <Widget
      settings={state.settings}
      track={state.track}
      clockOffset={state.serverTime - Date.now() / 1000}
    />
  ) : null;
}
function App() {
  const [s, setS] = useState<Settings>(defaults);
  const settingsRef = useRef(s);
  settingsRef.current = s;
  const t = createTranslator(s.language);
  const [uiTheme, setUiTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("retrotune-editor-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.uiTheme = uiTheme;
    try {
      localStorage.setItem("retrotune-editor-theme", uiTheme);
    } catch {}
  }, [uiTheme]);
  useEffect(() => {
    document.documentElement.lang = s.language || "ru";
    document.title = t("RETROTUNE — музыка на стриме");
  }, [s.language]);
  const [data, setData] = useState<Bootstrap | null>(null);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("Подключение…");
  const [tab, setTab] = useState("appearance");
  const [demo, setDemo] = useState(false);
  const [demoData, setDemoData] = useState(demoTrack);
  const [background, setBackground] = useState("checker");
  const [zoom, setZoom] = useState(85);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [dirty, setDirty] = useState(false);
  const token = useRef("");
  const initialized = useRef(false);
  const revision = useRef(0);
  const savedRevision = useRef(0);
  const sending = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 4000);
  };
  useEffect(() => {
    if (!help) return;
    const dialog = document.querySelector<HTMLElement>(".modal");
    const close = dialog?.querySelector<HTMLElement>("button");
    close?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;
      const items = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,a[href]",
        ),
      ];
      const first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    dialog?.addEventListener("keydown", trap);
    return () => {
      dialog?.removeEventListener("keydown", trap);
      document.querySelector<HTMLElement>(".page-heading>.button")?.focus();
    };
  }, [help]);
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const revBefore = revision.current;
      try {
        const r = await fetch("/api/bootstrap");
        if (!r.ok) throw Error("Сервис недоступен");
        const j: Bootstrap = await r.json();
        if (!alive) return;
        token.current = j.token;
        setData(j);
        setError("");
        if (!initialized.current) {
          initialized.current = true;
          setS(j.settings);
          setSaveState("Все изменения сохранены");
        } else if (
          revBefore === revision.current &&
          savedRevision.current === revision.current &&
          !sending.current
        ) {
          setS(j.settings);
        }
      } catch {
        if (alive)
          setError(
            "Нет связи с локальным сервисом. Запустите Start RETROTUNE.cmd.",
          );
      }
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  // Serialize writes and retry failed saves; a slow response cannot overwrite newer settings.
  useEffect(() => {
    const id = setInterval(async () => {
      if (
        !token.current ||
        sending.current ||
        savedRevision.current === revision.current
      )
        return;
      sending.current = true;
      const rev = revision.current;
      setSaveState("Сохранение…");
      try {
        const r = await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Retrotune-Token": token.current,
          },
          body: JSON.stringify(settingsRef.current),
        });
        if (!r.ok) throw Error((await r.json()).error);
        savedRevision.current = rev;
        setSaveState(
          rev === revision.current ? "Все изменения сохранены" : "Сохранение…",
        );
        if (rev === revision.current) setDirty(false);
      } catch (e) {
        setSaveState("Не сохранено · повторяем");
        setError(String(e));
      } finally {
        sending.current = false;
      }
    }, 350);
    return () => clearInterval(id);
  }, []);
  const update = (patch: Partial<Settings>) => {
    revision.current++;
    setDirty(true);
    setS((old) => ({ ...old, ...patch }));
    setSaveState("Сохранение…");
  };
  const chooseLayout = (id: Settings["layout"]) => {
    const base = {
      layout: id,
      order: ["art", "info"] as Settings["order"],
      showTitle: true,
      showArtist: true,
      showCover: true,
      showProgress: true,
      showTime: true,
      showHeader: true,
      showStatus: true,
      showDisc: false,
      width: 620,
      coverSize: 112,
    };
    if (id === "disc")
      Object.assign(base, {
        showDisc: true,
        showTitle: false,
        showArtist: false,
        showProgress: false,
        showTime: false,
        showStatus: false,
        showHeader: false,
        width: 300,
        coverSize: 160,
      });
    if (id === "minimal")
      Object.assign(base, {
        showCover: false,
        showArtist: false,
        showHeader: false,
        showStatus: false,
        width: 480,
      });
    if (id === "vertical") Object.assign(base, { width: 300, coverSize: 240 });
    update(base);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Скопировано в буфер обмена");
    } catch {
      notify("Не удалось скопировать. Выделите адрес вручную.");
    }
  };
  const exportSettings = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }),
    );
    a.download = "retrotune-preset.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importSettings = async (file?: File) => {
    if (!file) return;
    try {
      const candidate = JSON.parse(await file.text());
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Retrotune-Token": token.current,
        },
        body: JSON.stringify(candidate),
      });
      if (!r.ok) throw Error((await r.json()).error);
      const accepted = await r.json();
      update(accepted);
      notify("Оформление импортировано");
    } catch (e) {
      notify("Не удалось импортировать: " + String(e));
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const colorFields = [
    ["accent", "Заголовок окна"],
    ["background", "Фон виджета"],
    ["text", "Название трека"],
    ["secondary", "Исполнитель и время"],
    ["progressColor", "Прогресс"],
    ["borderColor", "Рамка"],
  ] as const;
  const currentTrack = demo ? demoData : data?.track || null;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <img
            className="brand-product-icon"
            src="/assets/retrotune-icon.png"
            width="42"
            height="42"
            alt=""
          />
          <span>
            RETRO<span>TUNE</span>
            <small>{t("МУЗЫКА НА СТРИМЕ")}</small>
          </span>
        </a>
        <div className="sidebar-rule" />
        <small className="nav-label">{t("РАБОЧЕЕ ПРОСТРАНСТВО")}</small>
        <nav>
          <button className="active" onClick={() => setTab("appearance")}>
            <SlidersHorizontal size={19} />
            {t("Редактор виджета")}
            <span>01</span>
          </button>
          <button
            onClick={() => setTab("sources")}
            className={tab === "sources" ? "selected" : ""}
          >
            <Radio size={19} />
            {t("Источники музыки")}
            <span className="nav-count">{data?.sources.length || 0}</span>
          </button>
        </nav>
        <div className="side-scene">
          <div className="pixel-sun" />
          <div className="pixel-cloud cloud-one" />
          <div className="pixel-cloud cloud-two" />
          <div className="pixel-building b1" />
          <div className="pixel-building b2" />
          <div className="pixel-building b3" />
          <div className="scene-note">♫</div>
          <div className="scene-floor" />
        </div>
        <div className="side-caption">
          Your stream.
          <br />
          Your soundtrack.<span>{t("Немного ностальгии в каждом треке.")}</span>
        </div>
        <div className="sidebar-bottom">
          <div className={`service-dot ${error ? "offline" : ""}`} />
          <div>
            {t("Локальный сервис")}
            <small>{error ? t("Нет подключения") : "127.0.0.1:47832"}</small>
          </div>
          <button aria-label={t("Инструкция")} onClick={() => setHelp(true)}>
            <HelpCircle size={18} />
          </button>
        </div>
        <small className="version">RETROTUNE v0.2 · MADE FOR OBS</small>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            {t("Рабочее пространство ")}
            <span>/</span> <b>{t("Редактор виджета")}</b>
          </div>
          <div className="topbar-controls">
            <label className="language-control">
              <Languages size={15} />
              <select
                aria-label={t("Язык интерфейса")}
                value={s.language || "ru"}
                disabled={!data}
                onChange={(e) =>
                  update({ language: e.target.value as Settings["language"] })
                }
              >
                <option value="ru">RU</option>
                <option value="en">EN</option>
              </select>
            </label>
            <button
              className="theme-control"
              aria-label={t("Тема редактора")}
              aria-pressed={uiTheme === "dark"}
              title={t(
                uiTheme === "dark"
                  ? "Светлая тема редактора"
                  : "Тёмная тема редактора",
              )}
              onClick={() => setUiTheme(uiTheme === "dark" ? "light" : "dark")}
            >
              {uiTheme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
              <span>{t(uiTheme === "dark" ? "Тёмная" : "Светлая")}</span>
            </button>
            <button
              className="text-button setup-link"
              onClick={() => setHelp(true)}
            >
              <HelpCircle size={16} />
              {t("Как подключить")}
            </button>
          </div>
        </header>
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span /> NOW PLAYING, YOUR WAY
            </div>
            <h1>
              {t("Музыка в вашем стиле")}
              <span>✦</span>
            </h1>
            <p>
              {t("Соберите свой виджет. Добавьте в OBS. Включайте музыку.")}
            </p>
          </div>
          <Btn primary onClick={() => setHelp(true)}>
            <Link2 size={17} />
            {t("Подключить к OBS")}
            <ArrowUpRight size={16} />
          </Btn>
        </div>
        {error && (
          <div className="error-banner" role="alert">
            {t(error)}
          </div>
        )}
        <div className="editor-grid">
          <section className="preview-column">
            <div className="section-top">
              <h2>
                <Monitor size={17} />
                {t("Предпросмотр")}
              </h2>
              <span className="live-badge">
                <span />
                LIVE PREVIEW
              </span>
            </div>
            <div className={`preview-stage bg-${background}`}>
              <div className="stage-top">
                <span>
                  {demo
                    ? t("ДЕМО · НЕ ПОПАДАЕТ В OBS")
                    : t("ПРОЗРАЧНЫЙ ФОН ДЛЯ OBS")}
                </span>
                <span>↗ 1:{(100 / zoom).toFixed(1)}</span>
              </div>
              <PreviewRenderer settings={s} track={currentTrack} zoom={zoom} />
              <div className="stage-bottom">
                <span>
                  {s.width} {t(" px · автоматическая высота")}
                </span>
                <div>
                  <button
                    title={t("Прозрачный фон")}
                    aria-label={t("Прозрачный фон")}
                    className={background === "checker" ? "chosen" : ""}
                    onClick={() => setBackground("checker")}
                  >
                    <span className="checker-swatch" />
                  </button>
                  <button
                    title={t("Тёмный фон")}
                    aria-label={t("Тёмный фон")}
                    className={background === "dark" ? "chosen" : ""}
                    onClick={() => setBackground("dark")}
                  >
                    <span className="dark-swatch" />
                  </button>
                  <button
                    title={t("Синий фон")}
                    aria-label={t("Синий фон")}
                    className={background === "blue" ? "chosen" : ""}
                    onClick={() => setBackground("blue")}
                  >
                    <span className="blue-swatch" />
                  </button>
                </div>
              </div>
            </div>
            <div className="preview-toolbar">
              <label className="demo-toggle">
                <input
                  type="checkbox"
                  checked={demo}
                  onChange={(e) => {
                    setDemo(e.target.checked);
                    setDemoData(demoTrack());
                  }}
                />
                {t("Демо-трек")}
              </label>
              {demo && (
                <button
                  className="icon-button"
                  aria-label={
                    demoData.playing ? t("Пауза демо") : t("Воспроизвести демо")
                  }
                  onClick={() =>
                    setDemoData((old) => ({
                      ...old,
                      playing: !old.playing,
                      sampledAt: Date.now() / 1000,
                      position: old.playing
                        ? Math.min(
                            old.duration,
                            old.position + (Date.now() / 1000 - old.sampledAt),
                          )
                        : old.position,
                    }))
                  }
                >
                  {demoData.playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
              )}
              <label className="zoom-control">
                {t("Масштаб до")}
                <input
                  aria-label={t("Масштаб предпросмотра")}
                  type="range"
                  min="25"
                  max="120"
                  value={zoom}
                  onChange={(e) => setZoom(+e.target.value)}
                />
                <span>{zoom}%</span>
              </label>
            </div>
            <div className="source-strip">
              <div className="source-icon">
                <Radio size={21} />
              </div>
              <div>
                <small>{t("ИСТОЧНИК МУЗЫКИ")}</small>
                <strong>
                  {s.source === "auto"
                    ? t("Автовыбор источника")
                    : data?.sources.find((x) => x.id === s.source)?.label ||
                      t("Закреплённый источник недоступен")}
                </strong>
                <span>
                  {data?.track
                    ? `${data.track.playing ? t("Воспроизводится") : t("На паузе")} · ${data.track.title || t("Без названия")}`
                    : t("Включите музыку или подключите вкладку")}
                </span>
              </div>
              <button className="text-button" onClick={() => setTab("sources")}>
                {t("Изменить")}
                <ArrowUpRight size={15} />
              </button>
            </div>
            <section className="layout-section">
              <div className="section-top">
                <h2>
                  <LayoutTemplate size={17} />
                  {t("Компоновка")}
                </h2>
                <span>{t("Начните с готового варианта")}</span>
              </div>
              <div className="layout-options">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    className={`layout-card ${s.layout === l.id ? "active" : ""}`}
                    onClick={() => chooseLayout(l.id)}
                    aria-pressed={s.layout === l.id}
                  >
                    <div className={`layout-mini mini-${l.id}`}>
                      <span>{l.icon}</span>
                      {s.layout === l.id && (
                        <i>
                          <Check size={10} />
                        </i>
                      )}
                    </div>
                    <strong>{t(l.name)}</strong>
                    <small>{t(l.desc)}</small>
                  </button>
                ))}
              </div>
            </section>
            <div className="obs-connect">
              <span className="obs-icon">
                <Monitor size={23} />
              </span>
              <div>
                <strong>{t("Готово к вашему эфиру")}</strong>
                <p>{t("Добавьте адрес как источник «Браузер» в OBS.")}</p>
                <div className="url-field">
                  <input
                    aria-label={t("URL источника OBS")}
                    readOnly
                    value={url}
                  />
                  <button
                    aria-label={t("Копировать адрес")}
                    onClick={() => copy(url)}
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>
              <a
                href="/overlay"
                target="_blank"
                rel="noreferrer"
                title={t("Открыть оверлей")}
              >
                <ExternalLink size={18} />
              </a>
            </div>
            <footer className="editor-footer">
              <span>
                <span className={dirty ? "save-dot pending" : "save-dot"} />
                {t(saveState)}
              </span>
              <button className="text-button" onClick={exportSettings}>
                <Download size={14} />
                {t("Экспорт пресета")}
              </button>
            </footer>
          </section>
          <section className="settings-panel">
            <div className="settings-title">
              <h2>{t("Настройки виджета")}</h2>
              <SlidersHorizontal size={17} />
            </div>
            <div className="tabs" role="tablist">
              {[
                ["appearance", t("Оформление"), Palette],
                ["elements", t("Элементы"), Shapes],
                ["sources", t("Источники"), Radio],
              ].map(([id, name, Icon]) => (
                <button
                  key={String(id)}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(String(id))}
                >
                  {React.createElement(Icon as typeof Palette, { size: 15 })}
                  {t(String(name))}
                </button>
              ))}
            </div>
            <div className="settings-content">
              {tab === "appearance" && (
                <>
                  <div className="group-title">
                    {t("Цветовая тема")}
                    <span>01</span>
                  </div>
                  <div className="theme-options">
                    {Object.entries(themes).map(([id, palette], i) => (
                      <button
                        aria-label={
                          [
                            t("Облачная"),
                            t("Ночная"),
                            t("Мятная"),
                            t("Розовая"),
                          ][i]
                        }
                        aria-pressed={s.theme === id}
                        className={s.theme === id ? "selected" : ""}
                        key={id}
                        onClick={() =>
                          update({ ...palette, theme: id as Settings["theme"] })
                        }
                      >
                        <span
                          style={{
                            background: palette.background,
                            borderColor: palette.accent,
                          }}
                        >
                          <i style={{ background: palette.accent }} />
                          {s.theme === id && (
                            <Check size={13} color={palette.text} />
                          )}
                        </span>
                        <small>
                          {[t("Облака"), t("Ночь"), t("Мята"), t("Сакура")][i]}
                        </small>
                      </button>
                    ))}
                  </div>
                  <div className="color-grid">
                    {colorFields.map(([key, label]) => (
                      <label className="color-field" key={key}>
                        <span>{t(label)}</span>
                        <div>
                          <input
                            aria-label={t(label)}
                            type="color"
                            value={s[key]}
                            onChange={(e) => update({ [key]: e.target.value })}
                          />
                          <code>{s[key].toUpperCase()}</code>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="group-title">
                    {t("Размеры и форма")}
                    <span>02</span>
                  </div>
                  <Range
                    label={t("Ширина виджета")}
                    value={s.width}
                    min={220}
                    max={1200}
                    onChange={(width) => update({ width })}
                  />
                  <Range
                    label={t("Скругление окна")}
                    value={s.radius}
                    min={0}
                    max={48}
                    onChange={(radius) => update({ radius })}
                  />
                  <Range
                    label={t("Размер обложки")}
                    value={s.coverSize}
                    min={48}
                    max={240}
                    onChange={(coverSize) => update({ coverSize })}
                  />
                  <Range
                    label={t("Скругление обложки")}
                    value={s.coverRadius}
                    min={0}
                    max={120}
                    onChange={(coverRadius) => update({ coverRadius })}
                  />
                  <Range
                    label={t("Внутренний отступ")}
                    value={s.padding}
                    min={0}
                    max={60}
                    onChange={(padding) => update({ padding })}
                  />
                  <Range
                    label={t("Расстояние между блоками")}
                    value={s.gap}
                    min={0}
                    max={60}
                    onChange={(gap) => update({ gap })}
                  />
                  <Range
                    label={t("Размер названия")}
                    value={s.fontSize}
                    min={12}
                    max={48}
                    onChange={(fontSize) => update({ fontSize })}
                  />
                  <Range
                    label={t("Непрозрачность")}
                    value={s.opacity}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(opacity) => update({ opacity })}
                  />
                </>
              )}
              {tab === "elements" && (
                <>
                  <div className="group-title">
                    {t("Что показывать")}
                    <span>01</span>
                  </div>
                  {(
                    [
                      ["showHeader", t("Заголовок ретроокна")],
                      ["showCover", t("Обложка альбома")],
                      ["showDisc", t("CD-диск")],
                      ["showStatus", t("Статус воспроизведения")],
                      ["showTitle", t("Название трека")],
                      ["showArtist", t("Исполнитель")],
                      ["showProgress", t("Прогресс-бар")],
                      ["showTime", t("Время трека")],
                    ] as const
                  ).map(([key, label]) => (
                    <Toggle
                      key={key}
                      label={t(label)}
                      checked={s[key]}
                      onChange={(value) => update({ [key]: value })}
                    />
                  ))}
                  <div className="group-title">
                    {t("Расположение")}
                    <span>02</span>
                  </div>
                  <p className="helper">
                    {t(
                      "Порядок блоков слева направо; в вертикальном виде — сверху вниз.",
                    )}
                  </p>
                  <div className="order-blocks">
                    {s.order.map((x, i) => (
                      <div key={x}>
                        <GripVertical size={15} />
                        {x === "art"
                          ? t("Обложка и диск")
                          : t("Информация о треке")}
                        <button
                          aria-label={t(
                            x === "art"
                              ? "Переместить обложку"
                              : "Переместить информацию",
                          )}
                          onClick={() =>
                            update({ order: [...s.order].reverse() })
                          }
                        >
                          {i === 0 ? "↓" : "↑"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="group-title">
                    {t("Движение и поведение")}
                    <span>03</span>
                  </div>
                  <Toggle
                    label={t("Бегущая строка")}
                    desc={t("Включается только для длинного текста")}
                    checked={s.marquee}
                    onChange={(marquee) => update({ marquee })}
                  />
                  <Range
                    label={t("Скорость строки")}
                    value={s.marqueeSpeed}
                    min={10}
                    max={100}
                    suffix={t("px/с")}
                    onChange={(marqueeSpeed) => update({ marqueeSpeed })}
                  />
                  <Toggle
                    label={t("Вращение диска")}
                    desc={t("Останавливается вместе с музыкой")}
                    checked={s.spin}
                    onChange={(spin) => update({ spin })}
                  />
                  <Toggle
                    label={t("Скрывать на паузе")}
                    checked={s.hidePaused}
                    onChange={(hidePaused) => update({ hidePaused })}
                  />
                  <label className="select-field">
                    {t("Если источник недоступен")}
                    <select
                      value={s.emptyMode}
                      onChange={(e) =>
                        update({
                          emptyMode: e.target.value as Settings["emptyMode"],
                        })
                      }
                    >
                      <option value="hide">{t("Скрывать виджет в OBS")}</option>
                      <option value="message">
                        {t("Показывать ожидание")}
                      </option>
                    </select>
                  </label>
                </>
              )}
              {tab === "sources" && (
                <>
                  <div className="group-title">
                    {t("Получение музыки")}
                    <span>01</span>
                  </div>
                  <p className="helper">
                    {t(
                      "Выберите все приложения автоматически или закрепите один источник. Данные обновляются каждую секунду.",
                    )}
                  </p>
                  <button
                    className={`source-option ${s.source === "auto" ? "selected" : ""}`}
                    onClick={() => update({ source: "auto" })}
                  >
                    <span className="source-option-icon">
                      <AudioLines size={21} />
                    </span>
                    <span>
                      <strong>{t("Автовыбор")}</strong>
                      <small>{t("Первый воспроизводящийся источник")}</small>
                    </span>
                    {s.source === "auto" && <Check size={16} />}
                  </button>
                  <div className="group-title">
                    {t("Приложения и вкладки")}
                    <span>{data?.sources.length || 0}</span>
                  </div>
                  <div className="windows-status">
                    <span className={`service-dot ${error ? "offline" : ""}`} />
                    {t(data?.windowsStatus || "Подключение к Windows…")}
                  </div>
                  {data?.sources.length ? (
                    data.sources.map((source) => (
                      <button
                        key={source.id}
                        className={`source-option ${s.source === source.id ? "selected" : ""}`}
                        onClick={() => update({ source: source.id })}
                      >
                        <span className="source-option-icon">
                          {source.kind === "browser" ? (
                            <Link2 size={20} />
                          ) : (
                            <Music2 size={20} />
                          )}
                        </span>
                        <span>
                          <strong>{source.label}</strong>
                          <small>
                            {source.playing ? "▶" : "Ⅱ"}{" "}
                            {source.title || t("Без названия")}
                          </small>
                        </span>
                        {s.source === source.id && <Check size={16} />}
                      </button>
                    ))
                  ) : (
                    <div className="empty-sources">
                      <Radio size={27} />
                      <strong>{t("Ждём вашу музыку")}</strong>
                      <p>
                        {t(
                          "Включите плеер с поддержкой медиасессий Windows или подключите вкладку расширением.",
                        )}
                      </p>
                    </div>
                  )}
                  <div className="group-title">
                    {t("Конкретная вкладка")}
                    <span>02</span>
                  </div>
                  <p className="helper">
                    {t("Установите расширение из папки ")}
                    <code>browser-extension</code>{" "}
                    {t(
                      " через «Загрузить распакованное» на странице расширений Chrome/Edge. В его окне вставьте ключ и нажмите «Подключить эту вкладку».",
                    )}
                  </p>
                  <Btn onClick={() => copy(token.current)} disabled={!data}>
                    <Copy size={15} />
                    {t("Копировать ключ подключения")}
                  </Btn>
                  <p className="helper small">
                    {t(
                      "После перезагрузки страницы подключите вкладку заново. Ключ хранится локально и не нужен в URL оверлея.",
                    )}
                  </p>
                  <div className="info-note">
                    <span>i</span>
                    <p>
                      {t(
                        "Захват звука сам по себе не содержит названия и обложки. Для нестандартного плеера доступен локальный API — описание в README.",
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="settings-bottom">
              <button
                className="text-button"
                onClick={() => {
                  update({
                    ...defaults,
                    language: s.language,
                    source: s.source,
                  });
                  notify("Оформление сброшено");
                }}
              >
                <RotateCcw size={14} />
                {t("Сбросить оформление")}
              </button>
              <button
                aria-label={t("Импортировать пресет")}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={16} />
              </button>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="application/json,.json"
                onChange={(e) => importSettings(e.target.files?.[0])}
              />
            </div>
          </section>
        </div>
        <div className="page-bottom">
          <span>{t("♫ Хорошая музыка заслуживает красивого места.")}</span>
          <span>{t("Локально. Без аккаунтов. Без подписок.")}</span>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {t(toast)}
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={t("Подключение к OBS")}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHelp(false);
            }}
          >
            <button
              autoFocus
              className="modal-close"
              aria-label={t("Закрыть инструкцию")}
              onClick={() => setHelp(false)}
            >
              ×
            </button>
            <div className="eyebrow">{t("НА СТРИМ ЗА МИНУТУ")}</div>
            <h2>{t("Ваша музыка — в OBS")}</h2>
            <ol>
              <li>{t("Оставьте локальный сервис RETROTUNE запущенным.")}</li>
              <li>
                {t("В OBS выберите «Сервис → Скрипты → +» и добавьте ")}
                <code>obs/retrotune.lua</code>
                {t(". Кнопка в скрипте создаст источник в текущей сцене.")}
              </li>
              <li>
                {t(
                  "Или добавьте источник «Браузер» вручную с адресом ниже. Размер: ",
                )}
                <b>1280 × 720</b>
                {t(", фон прозрачный. Размер виджета задаётся в редакторе.")}
              </li>
              <li>
                {t(
                  "Для панели внутри OBS: «Док-панели → Пользовательские док-панели браузера», адрес ",
                )}
                <code>{location.origin}</code>.
              </li>
            </ol>
            <div className="url-field">
              <input aria-label={t("Адрес оверлея")} readOnly value={url} />
              <button
                aria-label={t("Копировать URL")}
                onClick={() => copy(url)}
              >
                <Copy size={17} />
              </button>
            </div>
            <p className="helper">
              {t(
                "Демо-трек виден только в редакторе. В эфир поступает выбранный реальный источник. Этот виджет показывает метаданные; звук добавляется в OBS отдельно.",
              )}
            </p>
            <Btn primary onClick={() => setHelp(false)}>
              {t("Понятно")}
              <Check size={16} />
            </Btn>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  location.pathname === "/overlay" ? <Overlay /> : <App />,
);
