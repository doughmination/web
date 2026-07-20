"use client";

/* PresenceDashboard.tsx — the /discord profile page.
 *
 * A multi-panel dashboard: full-bleed masthead, then a panel grid. This is a
 * SEPARATE component from PresenceCard.tsx on purpose — that one is a compact
 * fixed-position widget (max-width 280px, hard 200px caps on row text) used 23×
 * on /cool-people, and /discord used to blow it up with ~155 lines of
 * `.presence-stage .pc-*` descendant overrides. Fighting a widget's constraints
 * with specificity is what left the Spotify progress bar short of full width.
 *
 * Both components share every hook and helper from presenceShared.ts, so only
 * presentation diverges — there's no duplicated data logic. Styles here are
 * scoped vanilla-extract (see presence-dashboard.css.ts), not globalStyle.
 *
 * Panels self-hide when they have no data, so the grid closes up rather than
 * leaving holes.
 */

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  ChevronRight, Clock as ClockIcon, Gem, Globe, PatchCheckFill,
} from "react-bootstrap-icons";
import {
  BADGE_FLAGS, CONNECTION_ICON, CONNECTION_URLS, NAME_FONTS, PLATFORM_ICONS,
  STATUS_TITLE, WL_TYPE_LABEL, assetUrl, avatarUrl, bannerUrl, clamp, elapsedStr,
  emojiUrl, fmt, fmtPrice, fmtSinceDate, guildBadgeUrl, intToHex, isRealName,
  mapSelfHostToPresence, proxyImg, useAlbumAccent, usePresenceFeed,
  useReducedMotion, useTicker, wlImg, collectibleForSlot,
  type Collectible, type Dict, type SelfJson,
} from "./presenceShared";
import * as s from "@/styles/presence-dashboard.css";

/** Status → the theme token used for its dot and label. */
const STATUS_VAR: Record<string, string> = {
  online: "var(--success)",
  idle: "var(--warning)",
  dnd: "var(--danger)",
  offline: "var(--text-faint)",
  streaming: "var(--accent-alt)",
};

/** <img> that removes itself on error (replaces the old onerror="this.remove()"). */
function SafeImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const src = typeof props.src === "string" ? props.src : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (failed != null && failed === src) return null;
  // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
  return <img {...props} onError={() => setFailed(src)} />;
}

/**
 * A panel whose heading toggles its body. Used for Connections and Wishlist,
 * which can both run long.
 *
 * Starts collapsed once the list passes `collapseAbove`, so a big list doesn't
 * dominate the grid on load, but a short one stays visible with no interaction.
 * The count sits in the heading so it reads as useful while closed. Open state
 * is React state rather than <details open>, because a socket presence push
 * re-renders this whole tree and would fight an uncontrolled element.
 */
function CollapsiblePanel({
  title, count, collapseAbove = 8, wide = false, children,
}: {
  title: string;
  count: number;
  collapseAbove?: number;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(count <= collapseAbove);
  const bodyId = useId();
  return (
    <section className={wide ? s.panelWide : s.panel}>
      <button
        type="button"
        className={`${s.panelToggle}${open ? "" : " " + s.panelToggleClosed}`}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className={s.panelCount}>{count}</span>
        <ChevronRight
          className={`${s.chevron}${open ? " " + s.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>
      <div id={bodyId} hidden={!open}>
        {/* Long lists scroll inside the panel instead of stretching the page. */}
        <div className={count > collapseAbove ? s.scrollArea : undefined}>{children}</div>
      </div>
    </section>
  );
}

/**
 * The equipped nameplate, as the backdrop behind the username — which is how
 * Discord itself uses it ("Make your name stand out"). Prefers the .webm since
 * these are animated, falls back to the static PNG when the user asks for
 * reduced motion or no video is offered.
 */
function Nameplate({ np }: { np: Collectible }) {
  const reduced = useReducedMotion();
  const still = np.static_image_url || np.animated_image_url || null;
  const useVideo = !reduced && !!np.video_url;
  if (!useVideo && !still) return null;
  return (
    <div className={s.nameplate} aria-hidden="true">
      {useVideo ? (
        <video
          className={s.nameplateMedia}
          src={np.video_url!}
          poster={still ?? undefined}
          autoPlay
          loop
          muted
          playsInline
          // A decorative loop should never grab the media session or controls.
          disablePictureInPicture
          tabIndex={-1}
        />
      ) : (
        <img className={s.nameplateMedia} src={still!} alt="" />
      )}
    </div>
  );
}

/* ---- masthead pieces ------------------------------------------------------ */

function Clock({ offsetMin, tzName }: { offsetMin: number; tzName: string | null }) {
  const now = useTicker(true);
  const local = new Date(now + offsetMin * 60000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  const sign = offsetMin >= 0 ? "+" : "-";
  const oh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
  const om = String(Math.abs(offsetMin) % 60).padStart(2, "0");
  return (
    <span
      className={s.chip}
      title={(tzName ? tzName + " " : "") + "(UTC" + sign + oh + ":" + om + ")"}
    >
      <ClockIcon aria-hidden="true" /> {hh}:{mm}
    </span>
  );
}

/* ---- now playing ---------------------------------------------------------- */

/** `accent` is the "r, g, b" triplet sampled off the album art, or null — the
    bar falls back to the theme accent from CSS when there's nothing to sample. */
function NowPlaying({ sp, accent }: { sp: Dict; accent: string | null }) {
  const ts = sp.timestamps as { start?: number; end?: number } | undefined;
  const start = ts?.start ?? 0;
  const end = ts?.end ?? 0;
  const live = end > start;
  const now = useTicker(live);

  const elapsed = live ? clamp(now - start, 0, end - start) : 0;
  const pct = live ? clamp((elapsed / (end - start)) * 100, 0, 100) : 0;

  return (
    <section className={s.panelWide}>
      <h2 className={s.panelTitle}>Listening to Spotify</h2>
      {/* Points at the site's own /music page rather than out to Spotify.
          next/link so it routes client-side and the bg-music audio in the
          persistent layout isn't torn down by a full page load. */}
      <Link className={s.npRow} href="/music">
        {sp.album_art_url ? (
          <SafeImg className={s.npArt} src={String(sp.album_art_url)} alt="" />
        ) : null}
        <div className={s.npBody}>
          <div className={s.npTitle}>{String(sp.song || "")}</div>
          <div className={s.npArtist}>{String(sp.artist || "")}</div>
          {sp.album ? <div className={s.npAlbum}>{String(sp.album)}</div> : null}
          <div className={s.npBar} role="progressbar" aria-valuemin={0} aria-valuemax={100}
               aria-valuenow={Math.round(pct)} aria-label="Track progress">
            <div
              className={s.npFill}
              style={{ width: pct + "%", background: accent ? `rgb(${accent})` : undefined }}
            />
          </div>
          <div className={s.npTimes}>
            <span>{live ? fmt(elapsed) : "0:00"}</span>
            <span>{live ? fmt(end - start) : "0:00"}</span>
          </div>
        </div>
      </Link>
    </section>
  );
}

/* ---- activities ----------------------------------------------------------- */

function ActivityRow({ a }: { a: Dict }) {
  const isCode = /visual studio code|vscode/i.test((a.name as string) || "");
  const ts = a.timestamps as { start?: number } | undefined;
  const start = ts?.start;
  const now = useTicker(!!start);

  const assets = (a.assets as Dict) || {};
  const large = assets.large_image && assetUrl(a.application_id as string, assets.large_image as string);
  const small = assets.small_image && assetUrl(a.application_id as string, assets.small_image as string);

  let kind = isCode ? "Coding" : "Playing " + ((a.name as string) || "");
  const party = a.party as { size?: number[] } | undefined;
  if (party?.size?.length === 2 && party.size[1]) {
    kind += " · " + party.size[0] + " of " + party.size[1];
  }
  const buttons = a.buttons as (string | { label?: string })[] | undefined;

  return (
    <div>
      <div className={s.actRow}>
        {large ? (
          <span className={s.actIcWrap}>
            <SafeImg className={s.actIc} src={String(large)} alt="" />
            {small ? (
              <SafeImg
                className={s.actIcBadge}
                src={String(small)}
                alt=""
                title={String(assets.small_text || "")}
              />
            ) : null}
          </span>
        ) : (
          <span className={s.actDot} aria-hidden="true" />
        )}
        <div className={s.actBody}>
          <div className={s.actKind}>{kind}</div>
          <div className={s.actTitle}>
            {(a.details as string) || (isCode ? "" : (a.name as string)) || ""}
          </div>
          <div className={s.actSub}>
            {(a.state as string) || (assets.large_text as string) || ""}
          </div>
          {start && now ? <div className={s.actElapsed}>{elapsedStr(start, now)}</div> : null}
        </div>
      </div>
      {buttons?.length ? (
        <div className={s.actButtons}>
          {buttons.map((b, i) => (
            <span className={s.actBtn} key={i}>
              {typeof b === "string" ? b : b?.label || "Open"}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StreamRow({ a }: { a: Dict }) {
  const url = a.url as string | undefined;
  const platform = url && /twitch/i.test(url) ? "Twitch" : url && /youtube/i.test(url) ? "YouTube" : "Live";
  const assets = (a.assets as Dict) || {};
  const thumb = assets.large_image_url ? proxyImg(assets.large_image_url as string, { w: 240 }) : null;
  const inner = (
    <>
      {thumb ? (
        <SafeImg className={s.streamThumb} src={thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span className={s.actDot} aria-hidden="true" />
      )}
      <div className={s.actBody}>
        <div className={s.actKind}>{"Streaming on " + platform}</div>
        <div className={s.actTitle}>{(a.details as string) || (a.name as string) || ""}</div>
        <div className={s.actSub}>{(a.state as string) || ""}</div>
      </div>
    </>
  );
  return url ? (
    <a className={s.actRow} href={url} target="_blank" rel="noopener">{inner}</a>
  ) : (
    <div className={s.actRow}>{inner}</div>
  );
}

/* ---- bio ------------------------------------------------------------------ */

/** Linkify URLs and swap <:name:id> for the emoji image, as React nodes. */
function bioNodes(raw: string): React.ReactNode[] {
  const EMOJI = /<(a)?:(\w+):(\d+)>/g;
  const URL = /https?:\/\/[^\s<]+/g;
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < raw.length) {
    EMOJI.lastIndex = i;
    URL.lastIndex = i;
    const em = EMOJI.exec(raw);
    const ur = URL.exec(raw);
    let hit: RegExpExecArray | null = null;
    let kind: string | null = null;
    if (em && (!ur || em.index <= ur.index)) { hit = em; kind = "emoji"; }
    else if (ur) { hit = ur; kind = "url"; }
    if (!hit) { out.push(raw.slice(i)); break; }
    if (hit.index > i) out.push(raw.slice(i, hit.index));
    if (kind === "emoji") {
      const url = emojiUrl({ id: hit[3], animated: hit[1] === "a" });
      out.push(
        url ? (
          <img key={key++} className={s.bioEmoji} src={url} alt={":" + hit[2] + ":"}
               title={":" + hit[2] + ":"} loading="lazy" />
        ) : hit[0],
      );
    } else {
      out.push(
        <a key={key++} href={hit[0]} target="_blank" rel="noopener noreferrer">{hit[0]}</a>,
      );
    }
    i = hit.index + hit[0].length;
  }
  return out;
}

/* ---- connections ---------------------------------------------------------- */

function ConnIcon({ type }: { type: string }) {
  const def = CONNECTION_ICON[String(type || "").toLowerCase()] || { Ic: Globe };
  if (def.img) {
    return <SafeImg className={s.connIcon} src={def.img} alt="" title={type} loading="lazy" />;
  }
  const Ic = def.Ic ?? Globe;
  return <Ic className={s.connIcon} title={type} role="img" aria-label={type} />;
}

/* ---- the dashboard -------------------------------------------------------- */

export default function PresenceDashboard({ userId }: { userId: string }) {
  const json: SelfJson | null = usePresenceFeed(userId);
  const data = json?.data;
  const apiUser = (data?.user as Dict) || {};

  const d = useMemo(() => (json ? mapSelfHostToPresence(json, userId) : null), [json, userId]);

  const spotify = d?.listening_to_spotify ? (d.spotify as Dict) : null;
  const accent = useAlbumAccent(spotify?.album_art_url as string | undefined);

  const bioRaw = apiUser.bio == null ? "" : String(apiUser.bio).trim();
  const bioContent = useMemo(() => (bioRaw ? bioNodes(bioRaw) : []), [bioRaw]);

  if (!d) return <div className={s.skeleton} aria-busy="true" aria-label="Loading profile" />;

  const u = (d.discord_user as Dict) || {};
  const acts = (d.activities as Dict[]) || [];
  const status = (d.discord_status as string) || "offline";
  const isStreaming = acts.some((a) => a.type === 1);
  const effectiveStatus = isStreaming ? "streaming" : status;
  const statusColour = STATUS_VAR[effectiveStatus] || STATUS_VAR.offline;

  const custom = acts.find((a) => a.type === 4);
  const hasCustom = !!(custom && (custom.state || (custom.emoji && (custom.emoji as Dict).id)));
  const games = acts.filter((a) => a.type === 0);
  const streams = acts.filter((a) => a.type === 1);

  const styles = u.display_name_styles as { colors?: number[]; font_id?: number } | undefined;
  const gradCols = styles?.colors?.length ? styles.colors.map(intToHex) : null;

  const pg = u.primary_guild as Dict | undefined;
  const showTag = !!(pg && pg.tag && pg.identity_enabled);
  const tagBadge = showTag ? guildBadgeUrl(pg!) : null;

  const deco = u.avatar_decoration_data as { asset?: string; url?: string } | undefined;
  const decoSrc = deco?.url
    ? deco.url
    : deco?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${deco.asset}.png`
      : null;

  // Equipped nameplate — rendered as art behind the username, Discord-style.
  const nameplate = collectibleForSlot(data?.collectibles, "nameplate");

  const banner = bannerUrl((apiUser.id as string) || userId, apiUser.banner as string);
  const tz = data?.timezone as { utc_offset_minutes?: number; timezone?: string } | undefined;
  const tzOffsetMin = typeof tz?.utc_offset_minutes === "number" ? tz.utc_offset_minutes : null;
  const pron = (apiUser.pronouns as string) || (data?.pronoundb as string) || "";

  const prem = apiUser.premium as Dict | undefined;
  const NITRO_LABEL: Record<string, string> = {
    nitro: "Nitro", classic: "Nitro Classic", basic: "Nitro Basic",
  };
  const nitroLabel = prem ? NITRO_LABEL[prem.type as string] : undefined;

  const doughBadges = Array.isArray(data?.badges) && (data.badges as Dict[]).length
    ? (data.badges as Dict[])
    : null;
  const clientBadges = Array.isArray(data?.clientBadges) ? (data.clientBadges as Dict[]) : [];
  const flagBadges = BADGE_FLAGS.filter(([bit]) => ((u.public_flags as number) || 0) & bit);
  const hasBadges = !!(doughBadges?.length || clientBadges.length || flagBadges.length);

  const conns = ((data?.connected_accounts as Dict[]) || []).filter((a) => a && isRealName(a.name));
  const wishlist = (Array.isArray(data?.wishlist) ? (data.wishlist as Dict[]) : []).filter(Boolean);

  const platformKeys: string[] = [];
  if (d.active_on_discord_desktop) platformKeys.push("desktop");
  if (d.active_on_discord_mobile) platformKeys.push("mobile");
  if (d.active_on_discord_web || d.active_on_discord_embedded) platformKeys.push("web");

  return (
    <div>
      <header className={s.masthead}>
        {banner ? (
          <SafeImg className={s.banner} src={banner} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className={s.bannerFallback} aria-hidden="true" />
        )}

        {/* Pinned to the masthead's far bottom-right corner, opposite the name. */}
        {nameplate ? <Nameplate np={nameplate} /> : null}

        <div className={s.identity}>
          <div className={s.avatarWrap}>
            <img
              className={s.avatar}
              src={avatarUrl(u as { id?: string; avatar?: string })}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            {decoSrc ? <SafeImg className={s.avatarDeco} src={decoSrc} alt="" aria-hidden="true" /> : null}
            <span
              className={s.statusPip}
              style={{ background: statusColour }}
              title={STATUS_TITLE[effectiveStatus] || "Offline"}
            />
          </div>

          <div className={s.idBlock}>
            <div className={`${s.nameRow} ${s.aboveNameplate}`}>
              <h1
                className={`${s.name}${gradCols ? " " + s.nameGradient : ""}`}
                style={{
                  backgroundImage: gradCols
                    ? "linear-gradient(90deg, " +
                      (gradCols.length === 1 ? gradCols[0] + "," + gradCols[0] : gradCols.join(", ")) +
                      ")"
                    : undefined,
                  fontFamily: (styles && NAME_FONTS[styles.font_id as number]) || undefined,
                }}
              >
                {(u.display_name as string) || (u.global_name as string) || (u.username as string) || "Discord User"}
              </h1>
              {showTag ? (
                <span className={s.guildTag}>
                  {tagBadge ? <SafeImg className={s.guildTagBadge} src={tagBadge} alt="" /> : null}
                  {String(pg!.tag)}
                </span>
              ) : null}
            </div>

            <div className={`${s.subRow} ${s.aboveNameplate}`}>
              {u.username ? <span className={s.handle}>@{String(u.username)}</span> : null}
              <span className={s.statusText} style={{ color: statusColour }}>
                <span className={s.statusDot} style={{ background: statusColour }} />
                {STATUS_TITLE[effectiveStatus] || "Offline"}
              </span>
              {pron ? <span className={s.chip}>{pron}</span> : null}
              {tzOffsetMin != null ? (
                <Clock offsetMin={tzOffsetMin} tzName={tz?.timezone || null} />
              ) : null}
              {nitroLabel ? (
                <span
                  className={s.nitroChip}
                  title={nitroLabel + (prem?.since ? " · since " + fmtSinceDate(prem.since as string) : "")}
                >
                  {nitroLabel}
                </span>
              ) : null}
              {prem?.guild_since ? (
                <span
                  className={s.chip}
                  title={"Boosting since " + fmtSinceDate(prem.guild_since as string)}
                  aria-label="Server booster"
                >
                  <Gem aria-hidden="true" />
                </span>
              ) : null}
              {platformKeys.length ? (
                <span className={s.platforms} aria-hidden="true">
                  {platformKeys.map((k) => {
                    const { Ic, label } = PLATFORM_ICONS[k];
                    return <Ic key={k} title={label} role="img" aria-label={label} />;
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {hasCustom ? (
          <div className={s.customStatus}>
            {(() => {
              const eu = emojiUrl(custom!.emoji as { id?: string; animated?: boolean });
              return eu ? <img className={s.customEmoji} src={eu} alt="" /> : null;
            })()}
            <span>{String(custom!.state || "")}</span>
          </div>
        ) : null}
      </header>

      <div className={s.grid}>
        {spotify ? <NowPlaying sp={spotify} accent={accent} /> : null}

        {games.length || streams.length ? (
          <section className={s.panel}>
            <h2 className={s.panelTitle}>Activity</h2>
            <div className={s.actList}>
              {games.map((a, i) => <ActivityRow a={a} key={"g" + i} />)}
              {streams.map((a, i) => <StreamRow a={a} key={"s" + i} />)}
            </div>
          </section>
        ) : null}

        {bioRaw ? (
          <section className={s.panel}>
            <h2 className={s.panelTitle}>About</h2>
            <p className={s.bio}>{bioContent}</p>
          </section>
        ) : null}

        {hasBadges ? (
          <section className={s.panel}>
            <h2 className={s.panelTitle}>Badges</h2>
            <div className={s.badgeGrid}>
              {doughBadges?.length
                ? doughBadges.map((b) => {
                    const img = (
                      <SafeImg
                        className={s.badge}
                        src={proxyImg("https://cdn.discordapp.com/badge-icons/" + String(b.icon) + ".png")}
                        alt={String(b.description || b.id)}
                        title={String(b.description || b.id)}
                      />
                    );
                    return b.link ? (
                      <a className={s.badgeLink} key={String(b.id)} href={String(b.link)}
                         target="_blank" rel="noopener">{img}</a>
                    ) : (
                      <span key={String(b.id)} style={{ lineHeight: 0 }}>{img}</span>
                    );
                  })
                : flagBadges.map(([bit, nm, hash]) => (
                    <SafeImg
                      key={bit}
                      className={s.badge}
                      src={proxyImg("https://cdn.discordapp.com/badge-icons/" + hash + ".png")}
                      alt={nm}
                      title={nm}
                    />
                  ))}
              {clientBadges.map((b) => (
                <SafeImg
                  key={String(b.id)}
                  className={s.badge}
                  src={String(b.icon_url)}
                  alt={String(b.tooltip || "")}
                  title={String(b.tooltip || "")}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </section>
        ) : null}

        {conns.length ? (
          <CollapsiblePanel title="Connections" count={conns.length}>
            <div className={s.connGrid}>
              {conns.map((a, i) => {
                const maker = CONNECTION_URLS[a.type as string];
                const url = maker ? maker(a.name as string, a.id as string) : null;
                const inner = (
                  <>
                    <ConnIcon type={a.type as string} />
                    <span className={s.connName}>{String(a.name)}</span>
                    {a.verified ? (
                      <span className={s.connCheck} title="Verified">
                        <PatchCheckFill aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                );
                const key = String(a.type) + ":" + String(a.id ?? a.name) + i;
                return url ? (
                  <a className={s.conn} key={key} href={url} target="_blank" rel="noopener">{inner}</a>
                ) : (
                  <span className={s.conn} key={key}>{inner}</span>
                );
              })}
            </div>
          </CollapsiblePanel>
        ) : null}

        {wishlist.length ? (
          <CollapsiblePanel title="Wishlist" count={wishlist.length} collapseAbove={6}>
            <div className={s.wlGrid}>
              {wishlist.map((w, i) => {
                const ic = wlImg(w);
                const typeLabel = WL_TYPE_LABEL[String(w.type)] || "";
                const price = fmtPrice(w.price as Dict);
                return (
                  <div className={`${s.wlItem}${w.is_owned ? " " + s.wlOwned : ""}`} key={i}>
                    {ic ? (
                      <SafeImg className={s.wlIc} src={ic} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    ) : null}
                    <div className={s.wlBody}>
                      <div className={s.wlName}>{String(w.name || "Collectible")}</div>
                      {typeLabel ? <div className={s.wlType}>{typeLabel}</div> : null}
                    </div>
                    {price ? <span className={s.wlPrice}>{price}</span> : null}
                  </div>
                );
              })}
            </div>
          </CollapsiblePanel>
        ) : null}
      </div>
    </div>
  );
}
