/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useMembers, useRelationships, type PluralMember } from "@doughmination/react-api";
import { normalizeColor } from "@/lib/utils";
import * as s from "@/styles/admin.css";

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const SIZE = 720;
const CENTER = SIZE / 2;
const RING_RADIUS = 280;
const NODE_RADIUS = 34;

interface GraphNode {
  id: string;
  member: PluralMember;
  x: number;
  y: number;
}

const RelationshipMap: React.FC = () => {
  const membersQuery = useMembers();
  const relationshipsQuery = useRelationships();

  const members = membersQuery.data ?? [];
  const relationships = relationshipsQuery.data?.relationships ?? [];

  const memberById = useMemo(() => {
    const lookup = new Map<string, PluralMember>();
    for (const member of members) {
      if (member.id) lookup.set(member.id, member);
      if (member.name) lookup.set(member.name, member);
    }
    return lookup;
  }, [members]);

  // Only members that appear in at least one relationship become nodes.
  const nodes = useMemo<GraphNode[]>(() => {
    const involved = new Set<string>();
    for (const edge of relationships) {
      involved.add(edge.members[0]);
      involved.add(edge.members[1]);
    }

    const resolved = Array.from(involved)
      .map((identifier) => memberById.get(identifier))
      .filter((member): member is PluralMember => Boolean(member));

    const count = resolved.length;
    return resolved.map((member, index) => {
      const angle = (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
      return {
        id: member.id,
        member,
        x: CENTER + RING_RADIUS * Math.cos(angle),
        y: CENTER + RING_RADIUS * Math.sin(angle),
      };
    });
  }, [relationships, memberById]);

  const nodeById = useMemo(() => {
    const lookup = new Map<string, GraphNode>();
    for (const node of nodes) {
      lookup.set(node.member.id, node);
      if (node.member.name) lookup.set(node.member.name, node);
    }
    return lookup;
  }, [nodes]);

  const loading = membersQuery.isLoading || relationshipsQuery.isLoading;

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Relationship Map</h1>
            <p className={s.pageSubtitle}>Who is dating who across the system</p>
          </div>
          <Button asChildHref="/">Back to Home</Button>
        </div>

        {loading ? (
          <div className={s.loadingText}>Loading map...</div>
        ) : nodes.length === 0 ? (
          <p className={s.emptyNote}>No relationships to show yet</p>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width="100%"
              style={{ maxWidth: `${SIZE}px`, margin: "0 auto", display: "block" }}
              role="img"
              aria-label="Relationship map"
            >
              <defs>
                {nodes.map((node) => (
                  <clipPath key={node.id} id={`clip-${node.id}`}>
                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS} />
                  </clipPath>
                ))}
              </defs>

              {relationships.map((edge) => {
                const from = nodeById.get(edge.members[0]);
                const to = nodeById.get(edge.members[1]);
                if (!from || !to) return null;
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                return (
                  <g key={edge.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="var(--accent)"
                      strokeWidth={2}
                      strokeOpacity={0.55}
                    />
                    <text
                      x={midX}
                      y={midY - 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--text-muted)"
                    >
                      {edge.type}
                    </text>
                  </g>
                );
              })}

              {nodes.map((node) => {
                const color = normalizeColor(node.member.color) || "var(--accent)";
                const name = node.member.display_name || node.member.name || node.member.id;
                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS + 2}
                      fill="var(--card, #1a1a1a)"
                      stroke={color}
                      strokeWidth={2}
                    />
                    <image
                      href={node.member.avatar_url || FALLBACK_AVATAR}
                      x={node.x - NODE_RADIUS}
                      y={node.y - NODE_RADIUS}
                      width={NODE_RADIUS * 2}
                      height={NODE_RADIUS * 2}
                      clipPath={`url(#clip-${node.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <text
                      x={node.x}
                      y={node.y + NODE_RADIUS + 16}
                      textAnchor="middle"
                      fontSize={13}
                      fill="var(--text)"
                    >
                      {name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Small helper so the header button stays a plain link without pulling in the
// full Button variant surface on a public page.
const Button: React.FC<{ children: React.ReactNode; asChildHref: string }> = ({
  children,
  asChildHref,
}) => (
  <Link href={asChildHref} className={s.chip} style={{ textDecoration: "none" }}>
    {children}
  </Link>
);

export default function RelationshipMapPage() {
  return <RelationshipMap />;
}
