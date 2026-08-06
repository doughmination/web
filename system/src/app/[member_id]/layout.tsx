/* system/src/app/[member_id]/layout.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata, Viewport } from "next";
import { cache } from "react";

// Server-safe entry: the client without the React provider/context, so it is
// usable from this server component. Importing the package root would evaluate
// createContext and crash RSC.
import {
  DoughminationClient,
  type PluralMember,
} from "@doughmination/react-api/server";

const FALLBACK_AVATAR = "https://m.doughmination.gay/img/avatars/favicon.png";

const SITE_NAME = "Doughmination System";

const DEFAULT_THEME_COLOR = "#0a0b10";

type RouteParams = {
  member_id: string;
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<RouteParams>;
};

// A custom fetch attaches Next's revalidate hint, so a burst of embed crawlers
// resolves to one API hit per 5 minutes rather than one per request.
const apiClient = new DoughminationClient({
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      next: {
        revalidate: 300,
      },
    }),
});

// Deduped per request: generateMetadata and generateViewport both call this,
// so wrapping in cache() means one lookup, not two.
const fetchMember = cache(
  async (memberId: string): Promise<PluralMember | null> => {
    if (!memberId) return null;

    try {
      return await apiClient.getMember(memberId);
    } catch {
      // getMember throws on 404 / network error — treat as "no member".
      return null;
    }
  },
);

// One-line summary when the member has no description of their own.
function buildDescription(member: PluralMember): string {
  if (member.description) return member.description;

  const parts: string[] = [];

  if (member.pronouns) parts.push(member.pronouns);
  if (member.tags && member.tags.length > 0) parts.push(member.tags.join(", "));
  if (member.pride && member.pride.length > 0) parts.push(member.pride.join(", "));

  if (parts.length > 0) {
    return `${parts.join(" · ")} — member of the ${SITE_NAME}.`;
  }

  return `A member of the ${SITE_NAME}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { member_id: memberId } = await params;
  const member = await fetchMember(memberId);

  if (!member) {
    return {
      title: `Member not found · ${SITE_NAME}`,
      description: `This member could not be found in the ${SITE_NAME}.`,
    };
  }

  const displayName = member.display_name || member.name || memberId;
  const title = `${displayName} · ${SITE_NAME}`;
  const description = buildDescription(member);
  const avatar = member.avatar_url || FALLBACK_AVATAR;
  const pageUrl = `https://doughmination.co.uk/${encodeURIComponent(memberId)}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: avatar,
          width: 800,
          height: 800,
          alt: displayName,
        },
      ],
      type: "profile",
      url: pageUrl,
      locale: "en_GB",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [avatar],
      site: "@doughmination",
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Viewport> {
  const { member_id: memberId } = await params;
  const member = await fetchMember(memberId);

  // The member colour drives the Discord embed's left strip. The API stores it
  // without a leading "#"; fall back to the site theme colour when unset.
  const themeColor = member?.color
    ? member.color.startsWith("#")
      ? member.color
      : `#${member.color}`
    : DEFAULT_THEME_COLOR;

  return {
    themeColor,
  };
}

export default function MemberLayout({ children }: LayoutProps) {
  return children;
}
