import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Settings, Track } from "./model";
import { time } from "./model";
import { createTranslator } from "./i18n";

function Marquee({
  text,
  enabled,
  speed,
}: {
  text: string;
  enabled: boolean;
  speed: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current!;
    const measure = () =>
      setDistance(
        Math.max(0, el.firstElementChild!.scrollWidth - el.clientWidth),
      );
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(el.firstElementChild!);
    measure();
    return () => ro.disconnect();
  }, [text]);
  return (
    <div
      ref={ref}
      className={`marquee ${enabled && distance > 0 ? "overflowing" : ""}`}
      title={text}
      style={
        {
          "--travel": `-${distance}px`,
          "--scroll-duration": `${Math.max(5, distance / speed + 4)}s`,
        } as CSSProperties
      }
    >
      <span>{text}</span>
    </div>
  );
}
function Artwork({ track, s }: { track: Track | null; s: Settings }) {
  const t = createTranslator(s.language);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [track?.cover]);
  if (!s.showCover && !s.showDisc) return null;
  return (
    <div
      className={`artwork ${s.showDisc ? "has-disc" : ""} ${!s.showCover ? "disc-only" : ""}`}
    >
      {s.showDisc && (
        <div
          className={`disc ${s.spin && track?.playing ? "spinning" : ""}`}
          aria-label={t("CD-диск")}
        >
          <div className="disc-label">
            RETROTUNE
            <br />
            DIGITAL AUDIO
          </div>
          <i />
        </div>
      )}
      {s.showCover && (
        <div className="album" style={{ borderRadius: s.coverRadius }}>
          {track?.cover && !failed ? (
            <img
              src={track.cover}
              onError={() => setFailed(true)}
              alt={track.album || t("Обложка трека")}
            />
          ) : (
            <div className="cover-fallback">
              <span>♫</span>
              <small>NO COVER</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function Widget({
  settings: s,
  track,
  preview = false,
  clockOffset = 0,
}: {
  settings: Settings;
  track: Track | null;
  preview?: boolean;
  clockOffset?: number;
}) {
  const t = createTranslator(s.language);
  const [now, setNow] = useState(Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 100);
    return () => clearInterval(id);
  }, []);
  if (
    !preview &&
    ((!track && s.emptyMode === "hide") ||
      (track && !track.playing && s.hidePaused))
  )
    return null;
  const pos = track
    ? Math.min(
        track.duration || 0,
        track.position +
          (track.playing
            ? Math.max(0, now + clockOffset - track.sampledAt) * track.rate
            : 0),
      )
    : 0;
  const hasInfo =
    s.showTitle || s.showArtist || s.showProgress || s.showTime || s.showStatus;
  const factor = s.showCover && s.showDisc ? 1.45 : 1;
  const available = s.width - 4 - 2 * s.padding;
  const gap =
    s.layout === "vertical" || !hasInfo
      ? s.gap
      : Math.min(s.gap, Math.max(0, available - 65 - 16 * factor));
  const room = available - (s.layout === "vertical" || !hasInfo ? 0 : gap + 65);
  const coverSize = Math.max(
    16,
    Math.min(s.coverSize, Math.floor(room / factor)),
  );
  const style = {
    "--widget-width": `${s.width}px`,
    "--cover-size": `${coverSize}px`,
    "--accent": s.accent,
    "--panel": s.background,
    "--ink": s.text,
    "--muted": s.secondary,
    "--progress": s.progressColor,
    "--edge": s.borderColor,
    "--gap": `${gap}px`,
    "--pad": `${s.padding}px`,
    "--track-size": `${s.fontSize}px`,
    borderRadius: s.radius,
    opacity: s.opacity / 100,
  } as CSSProperties;
  return (
    <article
      className={`music-widget layout-${s.layout} ${track?.playing ? "playing" : "paused"}`}
      style={style}
      aria-label={t("Музыкальный виджет")}
    >
      {s.showHeader && (
        <div className="widget-bar">
          <span className="mini-note">♫</span>
          <span>now playing.exe</span>
          <div className="window-dots">
            <i>−</i>
            <i>□</i>
            <i>×</i>
          </div>
        </div>
      )}
      <div className="widget-body">
        {s.order.map((block) =>
          block === "art" ? (
            <Artwork key="art" track={track} s={s} />
          ) : (
            <div className="track-info" key="info">
              {s.showStatus && (
                <div className="track-status">
                  <span className="equalizer">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  {track
                    ? track.playing
                      ? t("СЕЙЧАС ИГРАЕТ")
                      : t("НА ПАУЗЕ")
                    : t("ОЖИДАНИЕ МУЗЫКИ")}
                  <span className="status-star">✦</span>
                </div>
              )}
              {s.showTitle && (
                <h2>
                  <Marquee
                    text={
                      track
                        ? track.title || t("Без названия")
                        : t("Здесь появится ваш трек")
                    }
                    enabled={s.marquee}
                    speed={s.marqueeSpeed}
                  />
                </h2>
              )}
              {s.showArtist && (
                <div className="track-artist">
                  <Marquee
                    text={
                      track
                        ? track.artist || t("Исполнитель не указан")
                        : t("Включите музыку и выберите источник")
                    }
                    enabled={s.marquee}
                    speed={s.marqueeSpeed}
                  />
                </div>
              )}
              {s.showProgress && (
                <div
                  className="progress"
                  role="progressbar"
                  aria-label={t("Прогресс трека")}
                  aria-valuemin={0}
                  aria-valuemax={track?.duration || 100}
                  aria-valuenow={Math.floor(pos)}
                >
                  <div
                    style={{
                      width: `${track?.duration ? (pos / track.duration) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}
              {s.showTime && (
                <div className="track-times">
                  <span>{time(pos)}</span>
                  <span>
                    {track?.duration ? time(track.duration) : "LIVE / —:—"}
                  </span>
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </article>
  );
}
