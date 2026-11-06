export type Settings = {
  language: "ru" | "en";
  layout: "classic" | "vertical" | "disc" | "minimal" | "custom";
  theme: "cloud" | "night" | "mint" | "rose";
  width: number;
  coverSize: number;
  radius: number;
  accent: string;
  background: string;
  text: string;
  secondary: string;
  progressColor: string;
  borderColor: string;
  showCover: boolean;
  showTitle: boolean;
  showArtist: boolean;
  showProgress: boolean;
  showTime: boolean;
  showHeader: boolean;
  showDisc: boolean;
  showStatus: boolean;
  spin: boolean;
  marquee: boolean;
  marqueeSpeed: number;
  gap: number;
  padding: number;
  fontSize: number;
  coverRadius: number;
  opacity: number;
  hidePaused: boolean;
  emptyMode: "hide" | "message";
  source: string;
  order: ("art" | "info")[];
};
export type Track = {
  id: string;
  kind: string;
  label: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  position: number;
  duration: number;
  playing: boolean;
  rate: number;
  sampledAt: number;
};
export type Snapshot = {
  settings: Settings;
  track: Track | null;
  serverTime: number;
};
export type Bootstrap = Snapshot & {
  sources: Track[];
  token: string;
  windowsStatus: string;
};
export const defaults: Settings = {
  language: "ru",
  layout: "classic",
  theme: "cloud",
  width: 620,
  coverSize: 112,
  radius: 0,
  accent: "#192c9d",
  background: "#d4d4e5",
  text: "#191b44",
  secondary: "#555678",
  progressColor: "#ffcf66",
  borderColor: "#25234d",
  showCover: true,
  showTitle: true,
  showArtist: true,
  showProgress: true,
  showTime: true,
  showHeader: true,
  showDisc: false,
  showStatus: true,
  spin: true,
  marquee: true,
  marqueeSpeed: 35,
  gap: 20,
  padding: 20,
  fontSize: 23,
  coverRadius: 0,
  opacity: 100,
  hidePaused: false,
  emptyMode: "hide",
  source: "auto",
  order: ["art", "info"],
};
export const themes = {
  cloud: {
    accent: "#192c9d",
    background: "#d4d4e5",
    text: "#191b44",
    secondary: "#555678",
    progressColor: "#ffcf66",
    borderColor: "#25234d",
  },
  night: {
    accent: "#6c51b3",
    background: "#25243b",
    text: "#f6f0ff",
    secondary: "#b9afcf",
    progressColor: "#ffcf66",
    borderColor: "#131023",
  },
  mint: {
    accent: "#20645c",
    background: "#d2e5d7",
    text: "#123d38",
    secondary: "#446d60",
    progressColor: "#e0b958",
    borderColor: "#20463c",
  },
  rose: {
    accent: "#8b4167",
    background: "#f0dce6",
    text: "#592442",
    secondary: "#8a5f75",
    progressColor: "#b86b9b",
    borderColor: "#65314f",
  },
};
export const demoTrack = (): Track => ({
  id: "demo",
  kind: "demo",
  label: "Демонстрация",
  title: "A little break in the clouds",
  artist: "RETROTUNE · lofi radio",
  album: "Cloud City",
  cover: "/assets/cloud-city.svg",
  position: 87,
  duration: 224,
  playing: true,
  rate: 1,
  sampledAt: Date.now() / 1000,
});
export const time = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;
