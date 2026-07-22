/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMembers,
  useFronters,
  useSystem,
  useUserInfo,
  useConnectionStatus,
  type PluralMember,
} from "@doughmination/react-api";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn, normalizeColor, readableOnDark } from "@/lib/utils";
import * as site from "@/styles/site.css";
import * as s from "@/app/home.css";
import { Github } from "react-bootstrap-icons";

// The member shape comes straight from the package now.
type Member = PluralMember;

interface UserData {
  username: string;
  display_name?: string;
}

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const MENTAL_STATE_CLASSES: Record<string, string> = {
  safe: site.mentalStateSafe,
  unstable: site.mentalStateUnstable,
  "self-harming": site.mentalStateSelfHarming,
  "highly at risk": site.mentalStateHighlyAtRisk,
};

export default function HomePage() {
  const router = useRouter();

  // UI-only state; all server data now comes from the package hooks below.
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTagFilter, setCurrentTagFilter] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  // Live public data — seeded over REST, then kept current by the shared
  // socket (fronters + mental state are broadcast to every client, and the
  // provider invalidates on force_refresh).
  const membersQuery = useMembers();
  const frontersQuery = useFronters();
  const systemQuery = useSystem();
  const wsConnected = useConnectionStatus() === "open";

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((a, b) => {
      const nameA = (a.display_name || a.name || "").toLowerCase();
      const nameB = (b.display_name || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [membersQuery.data]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    members.forEach((m) => m.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [members]);

  const fronting = frontersQuery.data ?? null;
  const systemInfo = systemQuery.data ?? null;
  const loading =
    membersQuery.isLoading || frontersQuery.isLoading || systemQuery.isLoading;

  // Auth: the provider supplies the bearer token from localStorage, so
  // useUserInfo covers real accounts; the mock-* dev tokens are handled inline.
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);
  const isMock = token?.startsWith("mock-") ?? false;
  const userInfoQuery = useUserInfo({ enabled: Boolean(token) && !isMock });

  const { loggedIn, isAdmin, isOwner, currentUser } = useMemo(() => {
    if (!token) {
      return { loggedIn: false, isAdmin: false, isOwner: false, currentUser: null as UserData | null };
    }
    if (isMock) {
      return {
        loggedIn: true,
        isAdmin: token === "mock-admin",
        isOwner: token === "mock-owner",
        currentUser: { username: "mock-user", display_name: "Mock User" } as UserData,
      };
    }
    const u = userInfoQuery.data;
    if (!u) {
      return { loggedIn: false, isAdmin: false, isOwner: false, currentUser: null as UserData | null };
    }
    return {
      loggedIn: true,
      isAdmin: !!u.is_admin,
      isOwner: !!u.is_owner,
      currentUser: { username: u.username, display_name: u.display_name ?? undefined } as UserData,
    };
  }, [token, isMock, userInfoQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/");
  };

  // Event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleTagFilterChange = useCallback((filter: string | null) => {
    setCurrentTagFilter(filter);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  // Filter members based on search and tag filter
  useEffect(() => {
    let filtered = members;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          (member.display_name || member.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply tag filter
    if (currentTagFilter) {
      if (currentTagFilter === "untagged") {
        filtered = filtered.filter((member) => !member.tags || member.tags.length === 0);
      } else {
        filtered = filtered.filter((member) => member.tags?.includes(currentTagFilter));
      }
    }

    setFilteredMembers(filtered);
  }, [members, searchQuery, currentTagFilter]);

  // Check if a member is currently fronting
  const isMemberFronting = useCallback(
    (memberId: string, memberName?: string): boolean => {
      if (!fronting?.members || fronting.members.length === 0) {
        return false;
      }

      // Check direct fronting
      return fronting.members.some((m) => m.id === memberId || m.name === memberName);
    },
    [fronting],
  );

  // Mental state helper functions
  const getMentalStateLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      safe: "Safe",
      unstable: "Unstable",
      idealizing: "Idealizing",
      "self-harming": "Self-Harming",
      "highly at risk": "Highly At Risk",
    };
    return labels[level] || level;
  };

  const getMentalStateIcon = (level: string) => {
    const icons: { [key: string]: string } = {
      safe: "✅",
      unstable: "⚠️",
      idealizing: "❗",
      "self-harming": "🚨",
      "highly at risk": "⛔",
    };
    return icons[level] || "❓";
  };

  if (loading) {
    return (
      <div className={s.loadingWrap}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* WebSocket Connection Indicator */}
      {!wsConnected && (
        <div className={s.wsBanner}>⚠️ Live updates disconnected. Reconnecting...</div>
      )}

      {/* Header with navigation */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" className={s.logoLink}>
            Doughmination System®
          </Link>

          {/* Desktop Navigation */}
          <div className={s.desktopNavRow}>
            {loggedIn && currentUser && (
              <div className={s.navUser}>
                Logged in as:{" "}
                <span className={s.navUserName}>
                  {currentUser.display_name || currentUser.username}
                </span>
              </div>
            )}
            <ThemeToggle />
            {loggedIn ? (
              <>
                {isOwner && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/owner/dash">Owner Panel</Link>
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/dash">Admin Panel</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/metrics">Metrics</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/profile">Profile</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/login">Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={s.mobileMenuBtn}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className={s.icon24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation overlay */}
        {menuOpen && (
          <div className={s.mobileOverlay} onClick={toggleMenu}>
            <div className={s.mobilePanel} onClick={(e) => e.stopPropagation()}>
              <ul className={s.mobileList}>
                {loggedIn && currentUser && (
                  <li className={s.mobileUser}>
                    Logged in as:{" "}
                    <span className={s.mobileUserName}>
                      {currentUser.display_name || currentUser.username}
                    </span>
                  </li>
                )}
                {loggedIn ? (
                  <>
                    {isOwner && (
                      <li>
                        <Link href="/owner/dash" className={s.mobileLink} onClick={toggleMenu}>
                          Owner Panel
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <Link href="/admin/dash" className={s.mobileLink} onClick={toggleMenu}>
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href="/user/metrics" className={s.mobileLink} onClick={toggleMenu}>
                        Metrics
                      </Link>
                    </li>
                    <li>
                      <Link href="/user/profile" className={s.mobileLink} onClick={toggleMenu}>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className={s.mobileLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/user/login" className={s.mobileLink} onClick={toggleMenu}>
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Space for fixed header */}
      <div className={s.headerSpacer}></div>

      {/* Main content */}
      <main className={s.main}>
        <div className={s.contentWrapper}>
          <div>
            <h1 className={s.pageTitle}>System Members</h1>

            {/* Mental State Banner */}
            {systemInfo?.mental_state && (
              <div
                className={cn(
                  site.mentalStateBanner,
                  MENTAL_STATE_CLASSES[systemInfo.mental_state.level],
                )}
              >
                <div className={s.bannerRow}>
                  <span className={s.bannerIcon}>
                    {getMentalStateIcon(systemInfo.mental_state.level)}
                  </span>
                  <div>
                    <span>Current Status: </span>
                    <span>{getMentalStateLabel(systemInfo.mental_state.level)}</span>
                    {systemInfo.mental_state.notes && (
                      <p className={s.bannerNotes}>{systemInfo.mental_state.notes}</p>
                    )}
                  </div>
                </div>
                <small className={s.bannerUpdated}>
                  Last updated: {new Date(systemInfo.mental_state.updated_at).toLocaleString()}
                </small>
              </div>
            )}

            {/* Currently Fronting Section */}
            {fronting && fronting.members && fronting.members.length > 0 && (
              <div className={s.frontingSection}>
                <h2 className={s.frontingTitle}>
                  Currently {fronting.members.length > 1 ? "Co-fronting" : "Fronting"}
                </h2>
                <div className={s.frontingRow}>
                  {fronting.members.map((member, index) => {
                    const memberColor = normalizeColor(member.color);
                    const borderColor = memberColor || "var(--accent)";
                    const nameColor = readableOnDark(member.color, "var(--accent)");
                    // Appending "40" only yields valid CSS for a hex literal.
                    const glow = memberColor
                      ? `${memberColor}40`
                      : "color-mix(in srgb, var(--accent) 25%, transparent)";

                    return (
                      <div key={member.id || `${member.name}-${index}`} className={s.frontingItem}>
                        {/* Status Bubble - Thought Bubble Style */}
                        {member.status && (
                          <div className={s.bubbleWrap}>
                            <div className={s.bubble}>
                              <div className={s.bubbleRow}>
                                {member.status.emoji && (
                                  <span className={s.bubbleEmoji}>{member.status.emoji}</span>
                                )}
                                <span className={s.bubbleText}>{member.status.text}</span>
                              </div>
                              {/* Thought bubble circles - staggered diagonally toward avatar */}
                              <div className={s.bubbleDotWrapLarge}>
                                <div className={s.bubbleDotLarge}></div>
                              </div>
                              <div className={s.bubbleDotWrapSmall}>
                                <div className={s.bubbleDotSmall}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <Link href={`/${member.name}`}>
                          <div className={s.searchRelative}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={member.avatar_url || FALLBACK_AVATAR}
                              alt={member.display_name || member.name}
                              className={s.avatarImg}
                              style={{
                                borderColor: borderColor,
                                boxShadow: `0 0 12px ${glow}`,
                              }}
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                              }}
                            />
                          </div>
                        </Link>
                        <div className={s.frontingNameWrap}>
                          <Link
                            href={`/${member.name}`}
                            className={s.memberLink}
                            style={{ color: nameColor }}
                          >
                            {member.display_name || member.name || "Unknown"}
                          </Link>

                          {member.tags && member.tags.length > 0 && (
                            <div className={s.tagRow}>
                              {[...member.tags]
                                .sort((a, b) => a.localeCompare(b))
                                .map((tag, tagIndex) => (
                                  <span key={tagIndex} className={s.tagChip}>
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className={s.filtersBlock}>
              <div className={s.filterRow}>
                <button
                  onClick={() => handleTagFilterChange(null)}
                  className={cn(site.filterButton, currentTagFilter === null && site.filterButtonActive)}
                >
                  All Members
                </button>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilterChange(tag)}
                    className={cn(site.filterButton, currentTagFilter === tag && site.filterButtonActive)}
                  >
                    {tag}
                  </button>
                ))}
                <button
                  onClick={() => handleTagFilterChange("untagged")}
                  className={cn(
                    site.filterButton,
                    currentTagFilter === "untagged" && site.filterButtonActive,
                  )}
                >
                  Untagged
                </button>
              </div>

              <div className={site.searchContainer}>
                <div className={s.searchRelative}>
                  <svg className={site.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    id="member-search"
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={site.searchInput}
                  />
                  {searchQuery && (
                    <button onClick={clearSearch} className={site.searchClear}>
                      <svg className={s.icon20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Members Grid */}
            {filteredMembers.length > 0 ? (
              <div className={site.memberGrid} style={{ paddingTop: "3rem" }}>
                {filteredMembers.map((member) => {
                  const isFronting = isMemberFronting(member.id, member.name);
                  const memberColor = normalizeColor(member.color);
                  const borderColor = memberColor || "var(--accent)";
                  const nameColor = readableOnDark(member.color, "var(--text)");
                  const glow = memberColor
                    ? `${memberColor}40`
                    : "color-mix(in srgb, var(--accent) 25%, transparent)";

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        site.memberGridItem,
                        isFronting && site.frontingGlow,
                        s.gridItemRelative,
                      )}
                      style={
                        {
                          "--member-color": borderColor,
                        } as React.CSSProperties & { "--member-color": string }
                      }
                    >
                      {/* Status Bubble - Thought Bubble Style */}
                      {member.status && (
                        <div className={s.bubbleWrapGrid}>
                          <div className={s.bubble} style={{ maxWidth: "130px" }}>
                            <div className={s.bubbleRow}>
                              {member.status.emoji && (
                                <span className={s.bubbleEmoji}>{member.status.emoji}</span>
                              )}
                              <span className={s.bubbleText}>{member.status.text}</span>
                            </div>
                            {/* Thought bubble circles - staggered diagonally toward avatar */}
                            <div className={s.bubbleDotWrapLarge}>
                              <div className={s.bubbleDotLarge}></div>
                            </div>
                            <div className={s.bubbleDotWrapSmall}>
                              <div className={s.bubbleDotSmall}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <Link href={`/${member.name}`}>
                        <div className={s.cardCenter}>
                          <div className={s.relativeInline}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={member.avatar_url || FALLBACK_AVATAR}
                              alt={member.display_name || member.name}
                              className={s.avatarImgGrid}
                              style={{
                                borderColor: borderColor,
                                boxShadow: `0 0 12px ${glow}`,
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                              }}
                            />
                          </div>
                          <h3
                            className={s.memberCardName}
                            style={{ color: nameColor }}
                          >
                            {member.display_name || member.name}
                          </h3>
                          {member.pronouns && (
                            <p className={s.memberPronouns}>{member.pronouns}</p>
                          )}

                          {member.tags && member.tags.length > 0 && (
                            <div className={s.tagRowSpaced}>
                              {[...member.tags]
                                .sort((a, b) => a.localeCompare(b))
                                .slice(0, 2)
                                .map((tag, index) => (
                                  <span key={index} className={s.tagChip}>
                                    {tag}
                                  </span>
                                ))}
                              {member.tags.length > 2 && (
                                <span className={s.tagMore}>+{member.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={s.emptyState}>
                <p className={s.emptyText}>
                  {searchQuery || currentTagFilter
                    ? "No members found matching your criteria."
                    : "No members available."}
                </p>
                {(searchQuery || currentTagFilter) && (
                  <div className={s.emptyActions}>
                    {searchQuery && (
                      <Button variant="secondary" size="sm" onClick={clearSearch}>
                        Clear search
                      </Button>
                    )}
                    {currentTagFilter && (
                      <Button variant="secondary" size="sm" onClick={() => setCurrentTagFilter(null)}>
                        Clear filter
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={site.githubFooter}>
        <a
          href="https://github.com/doughmination/web/tree/main/system"
          target="_blank"
          rel="noopener noreferrer"
          className={site.githubButton}
        >
          <Github />
          View on GitHub
        </a>
        <p className={s.footerNote}>
          Doughmination System® is a trade mark in the United Kingdom under trademark number{" "}
          <a
            href="https://www.ipo.gov.uk/t-tmj.htm/t-tmj/tm-journals/2025-039/UK00004263144.html"
            target="_blank"
            rel="noopener noreferrer"
            className={s.footerNoteLink}
          >
            UK00004263144
          </a>
        </p>
      </footer>

      {/* SEO Content Section - Hidden visually but readable by search engines */}
      <section className={s.srOnly} aria-label="About Doughmination System">
        <h1>Doughmination System® - Real-Time Plural System Tracker</h1>
        <p>
          Welcome to the Doughmination System®, a plural system (DID/OSDD) management platform.
          Track current fronters, view all system members, and manage switching patterns in
          real-time.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Real-time fronting status tracking</li>
          <li>Comprehensive member profiles with pronouns and descriptions</li>
          <li>Mental health state monitoring</li>
          <li>Member tagging and categorization</li>
          <li>Switching metrics and analytics</li>
        </ul>
      </section>
    </div>
  );
}
