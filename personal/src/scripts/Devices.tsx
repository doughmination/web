/* src/scripts/Devices.tsx
 * ESAL-2.3
 */

"use client";

import { useDevices } from "@doughmination/react-api";
import type { DeviceRecord } from "@doughmination/react-api";

import { realText, relTime } from "./util";
import {
  BatteryHalf,
  Earbuds,
  LightningChargeFill,
  Smartwatch,
  Wifi,
} from "react-bootstrap-icons";

const NAMES: Record<string, string> = {
  iphone: "iPhone",
  macbook: "MacBook",
  ipad: "iPad",
  pc: "PC",
};

function deviceName(id: string): string {
  if (NAMES[id]) return NAMES[id];
  const s = String(id || "device");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function clampLevel(n: unknown): number | null {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : null;
}
function levelClass(lvl: number | null): string {
  if (lvl == null) return "dev-unknown";
  if (lvl <= 20) return "dev-low";
  if (lvl <= 50) return "dev-mid";
  return "dev-ok";
}
/* Accessory flags may arrive as booleans or the strings "true"/"false". */
function isConnected(v: unknown): boolean {
  return v === true || v === 1 || String(v).trim().toLowerCase() === "true";
}

function DeviceRow({ d }: { d: DeviceRecord }) {
  const lvl = clampLevel(d.level);
  const cls = levelClass(lvl);
  const charging = d.charging === true;
  const pct = lvl == null ? "—" : `${lvl}%`;
  const width = lvl == null ? 0 : lvl;
  const when = relTime(d.updated_at);
  const wifiName = realText(d.wifi);
  const watch = isConnected(d.watch);
  const airpods = isConnected(d.airpods);
  const hasMeta = charging || d.lowPowerMode === true || wifiName || watch || airpods || when;

  return (
    <div className={`dev-row ${cls}${charging ? " is-charging" : ""}`}>
      <div className="dev-main">
        <span className="dev-name">{deviceName(d.device)}</span>
        <span className="dev-track" role="img" aria-label={pct + (charging ? ", charging" : "")}>
          <span className="dev-fill" style={{ width: `${width}%` }} />
        </span>
        <span className="dev-pct">
          {charging ? <LightningChargeFill className="dev-bolt" aria-hidden="true" /> : null}
          {pct}
        </span>
      </div>
      {hasMeta ? (
        <div className="dev-meta">
          {charging ? (
            <span className="dev-tag dev-charging" title="Charging">
              <LightningChargeFill aria-hidden="true" /> Charging
            </span>
          ) : null}
          {d.lowPowerMode === true ? (
            <span className="dev-tag dev-lowpower" title="Low Power Mode">
              <BatteryHalf aria-hidden="true" /> Low Power
            </span>
          ) : null}
          {wifiName ? (
            <span className="dev-tag dev-wifi" title="Wi-Fi network">
              <Wifi aria-hidden="true" /> {wifiName}
            </span>
          ) : null}
          {watch ? (
            <span className="dev-tag dev-watch" title="Apple Watch connected">
              <Smartwatch aria-hidden="true" /> Watch
            </span>
          ) : null}
          {airpods ? (
            <span className="dev-tag dev-airpods" title="AirPods connected">
              <Earbuds aria-hidden="true" /> AirPods
            </span>
          ) : null}
          {when ? <span className="dev-when">{when}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Devices() {
  // Seeds from GET /v2/devices, then stays live via the socket's device_update
  // event (report merges the record, delete removes the key).
  const { data, isPending } = useDevices();

  // Render the shell while the feed is in flight — see the note in Fronting.tsx.
  const loading = isPending;

  const list = !data
    ? []
    : Object.keys(data)
        .map((key) => {
          const record = data[key];
          return { ...record, device: record.device || key };
        })
        .filter((d) => realText(d.device) !== "");

  list.sort((a, b) => {
    const la = clampLevel(a.level);
    const lb = clampLevel(b.level);
    return (
      (lb == null ? -1 : lb) - (la == null ? -1 : la) ||
      String(a.device).localeCompare(String(b.device))
    );
  });

  return (
    <section className="devices-card" aria-label="Device status" aria-busy={loading}>
      <div className="dev-head">
        <span className="dev-icon" aria-hidden="true" />
        <span className="dev-label">Devices</span>
      </div>
      <div className={loading ? "dev-rows is-fetching" : "dev-rows"}>
        {loading ? (
          <span className="dev-empty">loading data…</span>
        ) : list.length === 0 ? (
          <span className="dev-empty">no devices reporting</span>
        ) : (
          list.map((d) => <DeviceRow key={d.device} d={d} />)
        )}
      </div>
    </section>
  );
}
