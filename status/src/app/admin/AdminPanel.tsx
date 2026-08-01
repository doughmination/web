/* status/src/app/admin/AdminPanel.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/admin/AdminPanel.tsx — client: add/remove services via /api/services. */

"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  panel,
  form,
  field,
  label,
  input,
  grid,
  card,
  cardTop,
  cardName,
  cardUrl,
  rowActions,
  btnPrimary,
  btnDanger,
} from "@styles/status.css";
import type { Service } from "@lib/services";

export default function AdminPanel({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [container, setContainer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, container }),
      });
      const data = (await res.json()) as {
        service?: Service;
        error?: string;
      };
      if (!res.ok || !data.service) {
        throw new Error(data.error || "could not add service");
      }
      setServices((current) => [...current, data.service!]);
      setName("");
      setUrl("");
      setContainer("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("could not remove service");
      setServices((current) => current.filter((service) => service.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "failed");
    }
  }

  return (
    <div className={panel}>
      <form className={form} onSubmit={add}>
        <div className={field}>
          <label className={label} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Portainer"
            required
          />
        </div>

        <div className={field}>
          <label className={label} htmlFor="url">
            URL (public check)
          </label>
          <input
            id="url"
            className={input}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            type="url"
          />
        </div>

        <div className={field}>
          <label className={label} htmlFor="container">
            Container (backend check)
          </label>
          <input
            id="container"
            className={input}
            value={container}
            onChange={(event) => setContainer(event.target.value)}
            placeholder="info"
          />
        </div>

        <button className={btnPrimary} type="submit" disabled={busy}>
          {busy ? "Adding…" : "Add service"}
        </button>
      </form>

      {error && (
        <p style={{ color: "#f5a9b8", fontFamily: "monospace" }}>{error}</p>
      )}

      <div className={grid}>
        {services.map((service) => (
          <article key={service.id} className={card}>
            <div className={cardTop}>
              <span className={cardName}>{service.name}</span>
              <div className={rowActions}>
                <button
                  className={btnDanger}
                  type="button"
                  onClick={() => remove(service.id)}
                >
                  Remove
                </button>
              </div>
            </div>
            {service.url && <span className={cardUrl}>{service.url}</span>}
            {service.container && (
              <span className={cardUrl}>container: {service.container}</span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
