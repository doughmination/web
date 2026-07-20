"use client";

/* PresenceCard.tsx — the COMPACT Discord presence card, as a React component.
 *
 * Replaces the old imperative createPresenceCard() factory. Sole consumer is
 * FriendsGrid.tsx (/cool-people), which renders ~23 of these as mini cards.
 *
 * /discord used to render this too, scaled up by ~150 lines of
 * `.presence-stage .pc-*` descendant overrides. It now has its own
 * PresenceDashboard.tsx — a widget and a full page want genuinely different
 * markup, and fighting this component's compact constraints (max-width 280px,
 * 200px caps on row text) with CSS specificity is what kept the Spotify
 * progress bar from filling its container. Both components share every hook and
 * helper in presenceShared.ts, so no data logic is duplicated.
 *
 * Every class name, data-attribute and CSS custom property the old factory
 * toggled is preserved exactly — presence-card.css.ts keys off ~144 of them, so
 * the markup contract here is load-bearing. Notably:
 *   data-status / data-real-status, and the state classes has-banner,
 *   has-banner-color, has-accent, has-custom, has-sections, has-profile-grad,
 *   show-wishlist, is-gradient, is-mini, tier-*.
 *
 * Timers are scoped rather than global: the old card re-rendered everything on
 * a single 1s interval, whereas Clock / SpotifyProgress / ElapsedLabel each own
 * their tick, so an idle card does no work. Icons are react-bootstrap-icons
 * components (the old `bi` webfont markup rendered nothing once that CSS went).
 */

import { useEffect, useMemo, useState } from "react";
import {
  Clock as ClockIcon, Gem, GeoAltFill, Globe, PatchCheckFill, StarFill, Stars,
} from "react-bootstrap-icons";
import {
  BADGE_FLAGS, CONNECTION_ICON, CONNECTION_URLS, NAME_FONTS, PLATFORM_ICONS,
  STATUS_TITLE, WL_TYPE_LABEL, assetUrl, avatarUrl, bannerUrl, clamp, elapsedStr,
  emojiUrl, fmt, fmtPrice, fmtSinceDate, g, guildBadgeUrl, intToHex, isRealName,
  mapSelfHostToPresence, proxyImg, rgbTriplet, useAlbumAccent, usePresenceFeed,
  useTicker, wlImg,
  type Dict, type PresenceOpts, type SelfJson,
} from "./presenceShared";
import { renderDiscordMarkdown } from "./discordMarkdown";

/* ---- small shared bits ---------------------------------------------------- */

/** <img> that removes itself on error, replacing onerror="this.remove()".
    Tracks *which* src failed, so a new src retries without needing an effect. */
function SelfHidingImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const src = typeof props.src === "string" ? props.src : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (failed != null && failed === src) return null;
  // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
  return <img {...props} onError={() => setFailed(src)} />;
}

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
      className="pc-timezone"
      title={(tzName ? tzName + " " : "") + "(UTC" + sign + oh + ":" + om + ")"}
    >
      <ClockIcon aria-hidden="true" /> {hh}:{mm}
    </span>
  );
}

/* ---- head ----------------------------------------------------------------- */

function PlatformIcons({ d }: { d: Dict }) {
  const keys: string[] = [];
  if (d.active_on_discord_desktop) keys.push("desktop");
  if (d.active_on_discord_mobile) keys.push("mobile");
  if (d.active_on_discord_web || d.active_on_discord_embedded) keys.push("web");
  return (
    <span className="pc-platforms" aria-hidden="true">
      {keys.map((k) => {
        const { Ic, label } = PLATFORM_ICONS[k];
        return <Ic key={k} className="pc-plat" title={label} role="img" aria-label={label} />;
      })}
    </span>
  );
}

function Badges({
  flags, doughBadges, clientBadges,
}: { flags: number; doughBadges: Dict[] | null; clientBadges: Dict[] | null }) {
  // Custom badges from the API replace the Discord flag set entirely, exactly
  // as the old paintBadges() did.
  const primary = doughBadges?.length
    ? doughBadges.map((b) => {
        const img = (
          <SelfHidingImg
            className="pc-badge"
            data-badge-id={String(b.id)}
            src={proxyImg("https://cdn.discordapp.com/badge-icons/" + String(b.icon) + ".png")}
            alt={String(b.description || b.id)}
            title={String(b.description || b.id)}
          />
        );
        return b.link ? (
          <a
            className="pc-badge-link"
            key={String(b.id)}
            tabIndex={-1}
            href={String(b.link)}
            target="_blank"
            rel="noopener"
          >
            {img}
          </a>
        ) : (
          <span key={String(b.id)} style={{ display: "contents" }}>{img}</span>
        );
      })
    : BADGE_FLAGS.filter(([bit]) => (Number(flags) || 0) & bit).map(([bit, name, hash]) => (
        <SelfHidingImg
          key={bit}
          className="pc-badge"
          src={proxyImg("https://cdn.discordapp.com/badge-icons/" + hash + ".png")}
          alt={name}
          title={name}
        />
      ));

  return (
    <span className="pc-badges" aria-hidden="true">
      {primary}
      {(clientBadges || []).map((b) => (
        <SelfHidingImg
          key={String(b.id)}
          className="pc-badge pc-badge--client"
          data-badge-id={String(b.id)}
          src={String(b.icon_url)}
          alt={String(b.tooltip || "")}
          title={String(b.tooltip || "")}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ))}
    </span>
  );
}

function Premium({ prem }: { prem: Dict | undefined }) {
  const NITRO_LABEL: Record<string, string> = {
    nitro: "Nitro", classic: "Nitro Classic", basic: "Nitro Basic",
  };
  const label = prem ? NITRO_LABEL[prem.type as string] : undefined;
  const boosting = prem?.guild_since as string | undefined;
  if (!label && !boosting) return <span className="pc-premium" hidden />;
  const since = prem?.since ? " · since " + fmtSinceDate(prem.since as string) : "";
  return (
    <span className="pc-premium">
      {label ? <span className="pc-nitro" title={label + since}>{label}</span> : null}
      {boosting ? (
        <span
          className="pc-boost"
          title={"Boosting since " + fmtSinceDate(boosting)}
          aria-label="Server booster"
        >
          <Gem aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
}

/* ---- bio ------------------------------------------------------------------ */

/** Bios are Discord-flavoured Markdown, not plain text — **bold**,
    __underline__, ||spoilers||, > quotes and \ escapes all need interpreting.
    Shared with the dashboard so the two can't drift. */
function Bio({ text }: { text: unknown }) {
  const raw = text == null ? "" : String(text).trim();
  const nodes = useMemo(
    () =>
      raw
        ? renderDiscordMarkdown(raw, {
            emojiUrl,
            emojiClass: "pc-bio-emoji",
            spoilerClass: "pc-spoiler",
            linkClass: "pc-bio-link",
          })
        : [],
    [raw],
  );
  if (!raw) return <div className="pc-bio" hidden />;
  return <div className="pc-bio">{nodes}</div>;
}

/* ---- connections ---------------------------------------------------------- */

function ConnIcon({ type }: { type: string }) {
  const def = CONNECTION_ICON[String(type || "").toLowerCase()] || { Ic: Globe };
  if (def.img) {
    return (
      <SelfHidingImg
        className="pc-conn-ic"
        src={def.img}
        alt={type}
        title={type}
        loading="lazy"
      />
    );
  }
  const Ic = def.Ic ?? Globe;
  return <Ic className="pc-conn-ic" title={type} role="img" aria-label={type} />;
}

function Connections({ accounts }: { accounts: Dict[] | undefined }) {
  const list = (accounts || []).filter((a) => a && isRealName(a.name));
  if (!list.length) return <div className="pc-connections" hidden />;
  return (
    <div className="pc-connections">
      {list.map((a, i) => {
        const maker = CONNECTION_URLS[a.type as string];
        const url = maker ? maker(a.name as string, a.id as string) : null;
        const inner = (
          <>
            <ConnIcon type={a.type as string} />
            <span className="pc-conn-name">{String(a.name)}</span>
            {a.verified ? (
              <span className="pc-conn-check" title="Verified">
                <PatchCheckFill aria-hidden="true" />
              </span>
            ) : null}
          </>
        );
        const key = String(a.type) + ":" + String(a.id ?? a.name) + i;
        return url ? (
          <a className="pc-conn" key={key} href={url} target="_blank" rel="noopener">
            {inner}
          </a>
        ) : (
          <span className="pc-conn" key={key}>{inner}</span>
        );
      })}
    </div>
  );
}

/* ---- wishlist ------------------------------------------------------------- */

function Wishlist({ items }: { items: Dict[] | null }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="pc-wishlist" id="pc-wishlist">
      <div className="pc-wishlist-title">Wishlist</div>
      {list.length ? (
        list.map((w, i) => {
          const ic = wlImg(w);
          const typeLabel = WL_TYPE_LABEL[String(w.type)] || "";
          const price = fmtPrice(w.price as Dict);
          return (
            <span className={"pc-wl-item" + (w.is_owned ? " is-owned" : "")} key={i}>
              {ic ? (
                <SelfHidingImg
                  className="pc-wl-ic"
                  src={ic}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="pc-wl-text">
                <span className="pc-wl-name">{String(w.name || "Collectible")}</span>
                {typeLabel ? <span className="pc-wl-type">{typeLabel}</span> : null}
              </span>
              {price ? <span className="pc-wl-price">{price}</span> : null}
            </span>
          );
        })
      ) : (
        <p className="pc-wl-empty">
          nothing on the wishlist yet <Stars aria-hidden="true" />
        </p>
      )}
    </div>
  );
}

/* ---- activity rows -------------------------------------------------------- */

function RowText({
  kind, title, sub, children,
}: { kind: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <span className="pc-row-text">
      <span className="pc-row-kind">{kind}</span>
      <span className="pc-row-title">{title}</span>
      <span className="pc-row-sub">{sub}</span>
      {children}
    </span>
  );
}

function CustomRow({ a }: { a: Dict }) {
  const eu = emojiUrl(a.emoji as { id?: string; animated?: boolean });
  return (
    <div className="pc-row pc-custom">
      {eu ? (
        <img className="pc-emoji" src={eu} alt="" />
      ) : (
        <span className="pc-row-ic pc-dot" aria-hidden="true" />
      )}
      <span className="pc-custom-text">{String(a.state || "")}</span>
    </div>
  );
}

function SpotifyRow({ s }: { s: Dict }) {
  const ts = s.timestamps as { start?: number; end?: number } | undefined;
  const start = ts?.start ?? 0;
  const end = ts?.end ?? 0;
  const live = end > start;
  const now = useTicker(live);

  const elapsed = live ? clamp(now - start, 0, end - start) : 0;
  const pct = live ? clamp((elapsed / (end - start)) * 100, 0, 100) : 0;

  return (
    <a
      className="pc-row pc-spotify"
      target="_blank"
      rel="noopener"
      href={s.track_id ? "https://open.spotify.com/track/" + s.track_id : "https://open.spotify.com/"}
      title={s.album ? (s.song || "") + " — " + s.album : undefined}
      data-start={start || undefined}
      data-end={end || undefined}
    >
      {s.album_art_url ? (
        <img className="pc-art" src={String(s.album_art_url)} alt="" />
      ) : null}
      <RowText
        kind="Listening to Spotify"
        title={(s.song as string) || ""}
        sub={(s.artist as string) || ""}
      >
        <span className="pc-progress" aria-hidden="true">
          <span className="pc-bar">
            <span className="pc-fill" style={{ width: pct + "%" }} />
          </span>
          <span className="pc-times">
            <span className="pc-cur">{live ? fmt(elapsed) : "0:00"}</span>
            <span className="pc-dur">{live ? fmt(end - start) : "0:00"}</span>
          </span>
        </span>
      </RowText>
    </a>
  );
}

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
    <div
      className={"pc-row pc-row--stack " + (isCode ? "pc-dev" : "pc-game")}
      data-elapsed-start={start || undefined}
    >
      <div className="pc-row-link">
        {large ? (
          <span className="pc-ic-wrap">
            <img className="pc-row-ic-img" src={String(large)} alt="" />
            {small ? (
              <SelfHidingImg
                className="pc-ic-badge"
                src={String(small)}
                alt=""
                title={String(assets.small_text || "")}
              />
            ) : null}
          </span>
        ) : (
          <span className="pc-row-ic pc-dot" aria-hidden="true" />
        )}
        <RowText
          kind={kind}
          title={(a.details as string) || (isCode ? "" : (a.name as string)) || ""}
          sub={(a.state as string) || (assets.large_text as string) || ""}
        >
          <span className="pc-row-elapsed">{start && now ? elapsedStr(start, now) : ""}</span>
        </RowText>
      </div>
      {buttons?.length ? (
        <div className="pc-buttons">
          {buttons.map((label, i) => (
            <span className="pc-btn" key={i}>
              {typeof label === "string" ? label : label?.label || "Open"}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The stream thumbnail degrades to a plain dot, matching the old inline
    onerror that swapped in a .pc-row-ic.pc-dot span. */
function StreamThumb({ src }: { src: string }) {
  const [dead, setDead] = useState(false);
  if (dead) return <span className="pc-row-ic pc-dot" aria-hidden="true" />;
  return (
    <img
      className="pc-stream-thumb"
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setDead(true)}
    />
  );
}

function StreamRow({ a }: { a: Dict }) {
  const url = a.url as string | undefined;
  const platform = url && /twitch/i.test(url) ? "Twitch" : url && /youtube/i.test(url) ? "YouTube" : "Live";
  const assets = (a.assets as Dict) || {};
  const thumb = assets.large_image_url ? proxyImg(assets.large_image_url as string, { w: 240 }) : null;

  const inner = (
    <>
      {thumb ? <StreamThumb src={thumb} /> : <span className="pc-row-ic pc-dot" aria-hidden="true" />}
      <RowText
        kind={"Streaming on " + platform}
        title={(a.details as string) || (a.name as string) || ""}
        sub={(a.state as string) || ""}
      />
    </>
  );

  return url ? (
    <a className="pc-row pc-stream" target="_blank" rel="noopener" href={url}>{inner}</a>
  ) : (
    <div className="pc-row pc-stream">{inner}</div>
  );
}

/* ---- the card ------------------------------------------------------------- */

export default function PresenceCard(opts: PresenceOpts) {
  const userId = opts.userId || null;
  const json: SelfJson | null = usePresenceFeed(userId, opts.pollMs);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const data = json?.data;
  const apiUser = (data?.user as Dict) || {};
  const d = useMemo(
    () => (json ? mapSelfHostToPresence(json, userId) : null),
    [json, userId],
  );

  const spotify = d?.listening_to_spotify ? (d.spotify as Dict) : null;
  const accent = useAlbumAccent(spotify?.album_art_url as string | undefined);

  // Nothing to show at all — same guard the factory had.
  if (!userId && !opts.fallbackName) return null;

  const u = (d?.discord_user as Dict) || {};
  const acts = (d?.activities as Dict[]) || [];
  const status = (d?.discord_status as string) || "offline";
  const isStreaming = acts.some((a) => a.type === 1);
  const effectiveStatus = isStreaming ? "streaming" : status;

  const tz = data?.timezone as { utc_offset_minutes?: number; timezone?: string } | undefined;
  const tzOffsetMin = typeof tz?.utc_offset_minutes === "number" ? tz.utc_offset_minutes : null;

  const custom = acts.find((a) => a.type === 4);
  const hasCustom = !!(custom && (custom.state || (custom.emoji && (custom.emoji as Dict).id)));
  const games = acts.filter((a) => a.type === 0);
  const streams = acts.filter((a) => a.type === 1);
  const hasSections = !!spotify || games.length > 0 || streams.length > 0;

  // Before the first payload lands, fall back to the props the grid passed.
  const displayName = d
    ? (u.display_name as string) || (u.global_name as string) || (u.username as string) || "Discord User"
    : opts.fallbackName || "";
  const handle = d ? (u.username ? "@" + u.username : "") : opts.fallbackUser ? "@" + opts.fallbackUser : "";
  const avatar = d
    ? avatarUrl(u as { id?: string; avatar?: string })
    : opts.fallbackImg || avatarUrl({ id: userId });

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

  const themeColors = Array.isArray(apiUser.theme_colors) ? (apiUser.theme_colors as number[]) : null;
  const hasGrad = !!(themeColors && themeColors.length >= 2);

  const banner = d ? bannerUrl((apiUser.id as string) || userId || "", apiUser.banner as string) : null;
  const bannerColor =
    typeof apiUser.accent_color === "number" ? intToHex(apiUser.accent_color as number) : null;

  const loc = g(d?.kv, "location") as string | undefined;
  const pron = (apiUser.pronouns as string) || (data?.pronoundb as string) || "";

  const doughBadges = Array.isArray(data?.badges) && (data.badges as Dict[]).length
    ? (data.badges as Dict[])
    : null;
  const clientBadges = Array.isArray(data?.clientBadges) ? (data.clientBadges as Dict[]) : null;
  const wishlistItems = Array.isArray(data?.wishlist) ? (data.wishlist as Dict[]) : null;

  const className = [
    "presence-card",
    opts.mini ? "is-mini" : "",
    opts.tier ? "tier-" + opts.tier : "",
    banner ? "has-banner" : "",
    !banner && bannerColor ? "has-banner-color" : "",
    accent ? "has-accent" : "",
    hasCustom ? "has-custom" : "",
    hasSections ? "has-sections" : "",
    hasGrad ? "has-profile-grad" : "",
    wishlistOpen ? "show-wishlist" : "",
  ].filter(Boolean).join(" ");

  const cardStyle: React.CSSProperties & Record<string, string | undefined> = {
    fontFamily: "'DDN gg sans', sans-serif",
  };
  if (accent) cardStyle["--dc-accent"] = accent;
  if (bannerColor && !banner) cardStyle["--pc-banner-color"] = bannerColor;
  if (hasGrad) {
    cardStyle["--pc-grad-1-rgb"] = rgbTriplet(themeColors![0]);
    cardStyle["--pc-grad-2-rgb"] = rgbTriplet(themeColors![1]);
  }

  const goLink = () => opts.link && window.open(opts.link, "_blank", "noopener");

  return (
    <div
      id={opts.mini ? undefined : "discord"}
      className={className}
      style={cardStyle}
      data-status={effectiveStatus}
      data-real-status={status}
      hidden={!d && !opts.fallbackName}
    >
      {banner ? (
        <SelfHidingImg className="pc-banner" src={banner} alt="" referrerPolicy="no-referrer" />
      ) : (
        <img className="pc-banner" alt="" referrerPolicy="no-referrer" hidden />
      )}

      <div className="pc-head">
        <span className="pc-avatar">
          <img
            className="pc-av-img"
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            src={avatar}
          />
          {decoSrc ? (
            <img className="pc-av-deco" alt="" aria-hidden="true" src={decoSrc} />
          ) : (
            <img className="pc-av-deco" alt="" aria-hidden="true" hidden />
          )}
          <span className="pc-status" aria-hidden="true" />
        </span>

        <span className="pc-id">
          <span className="pc-name-row">
            <span
              className={
                "pc-name" +
                (opts.link ? " pc-name--link" : "") +
                (gradCols ? " is-gradient" : "")
              }
              role={opts.link ? "link" : undefined}
              tabIndex={opts.link ? 0 : undefined}
              onClick={opts.link ? goLink : undefined}
              onKeyDown={
                opts.link
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goLink();
                      }
                    }
                  : undefined
              }
              style={{
                backgroundImage: gradCols
                  ? "linear-gradient(90deg, " +
                    (gradCols.length === 1 ? gradCols[0] + "," + gradCols[0] : gradCols.join(", ")) +
                    ")"
                  : undefined,
                fontFamily: (styles && NAME_FONTS[styles.font_id as number]) || undefined,
              }}
            >
              {displayName}
            </span>
            {showTag ? (
              <span className="pc-tag">
                {tagBadge ? (
                  <SelfHidingImg className="pc-tag-badge" src={tagBadge} alt="" />
                ) : null}
                <span className="pc-tag-text">{String(pg!.tag)}</span>
              </span>
            ) : (
              <span className="pc-tag" hidden />
            )}
          </span>

          <span className="pc-sub-row">
            <span className="pc-user">{handle}</span>
            <span className="pc-status-text">{STATUS_TITLE[effectiveStatus] || "Offline"}</span>
            {pron ? <span className="pc-pronouns">{pron}</span> : <span className="pc-pronouns" hidden />}
            {tzOffsetMin != null ? (
              <Clock offsetMin={tzOffsetMin} tzName={tz?.timezone || null} />
            ) : (
              <span className="pc-timezone" hidden />
            )}
            <Premium prem={apiUser.premium as Dict | undefined} />
            {d ? <PlatformIcons d={d} /> : <span className="pc-platforms" aria-hidden="true" />}
          </span>

          {loc ? (
            <span className="pc-meta">
              <span className="pc-pin" aria-hidden="true">
                <GeoAltFill />
              </span>
              {loc}
            </span>
          ) : (
            <span className="pc-meta" hidden />
          )}

          <Badges
            flags={(u.public_flags as number) || 0}
            doughBadges={doughBadges}
            clientBadges={clientBadges}
          />

          {hasCustom ? <CustomRow a={custom!} /> : null}
        </span>

        <button
          className={"pc-star" + (wishlistOpen ? " on" : "")}
          type="button"
          aria-label="show wishlist"
          title="wishlist"
          aria-expanded={wishlistOpen}
          onClick={(e) => {
            e.stopPropagation();
            setWishlistOpen((v) => !v);
          }}
        >
          <StarFill aria-hidden="true" />
        </button>
      </div>

      <Bio text={apiUser.bio} />
      <Connections accounts={data?.connected_accounts as Dict[] | undefined} />

      <div className="pc-sections">
        {spotify ? <SpotifyRow s={spotify} /> : null}
        {games.map((a, i) => <ActivityRow a={a} key={"g" + i} />)}
        {streams.map((a, i) => <StreamRow a={a} key={"s" + i} />)}
      </div>

      <Wishlist items={wishlistItems} />
    </div>
  );
}
