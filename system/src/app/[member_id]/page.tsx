/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMember, useMemberStatus } from "@doughmination/react-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { normalizeColor, readableOnDark } from "@/lib/utils";
import * as s from "./member.css";

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

export default function MemberDetails() {
  const params = useParams<{ member_id: string }>();
  const member_id = params?.member_id;

  // The member endpoint doesn't carry the status note, so fetch it alongside
  // and merge — exactly what the old two-request effect did.
  const memberQuery = useMember(member_id);
  const statusQuery = useMemberStatus(member_id);

  const loading = memberQuery.isLoading;
  const member = useMemo(() => {
    if (!memberQuery.data) return null;
    return {
      ...memberQuery.data,
      status: statusQuery.data?.status ?? memberQuery.data.status ?? null,
    };
  }, [memberQuery.data, statusQuery.data]);

  const error = !member_id
    ? "No member ID provided"
    : memberQuery.isError
      ? "Member not found or error occurred"
      : "";

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading member details...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className={s.page}>
        <div className={s.errorWrap}>
          <Alert variant="destructive">
            <AlertDescription>{error || "Member not found"}</AlertDescription>
          </Alert>
          <div className={s.errorActions}>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const memberColor = normalizeColor(member.color);
  const borderColor = memberColor || "var(--accent)";
  const nameColor = readableOnDark(member.color, "var(--text)");
  // Appending an alpha suffix only yields valid CSS for a hex literal.
  const glow = memberColor
    ? `${memberColor}40`
    : "color-mix(in srgb, var(--accent) 25%, transparent)";
  const pronounColor = memberColor
    ? `${nameColor}cc`
    : "var(--text-muted)";

  return (
    <div className={s.page}>
      <div className={s.cardWrap}>
        <Card>
          <CardHeader className={s.headerCenter}>
            <div className={s.avatarBlock}>
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
                    <div className={s.bubbleDot1Wrap}>
                      <div className={s.bubbleDot1}></div>
                    </div>
                    <div className={s.bubbleDot2Wrap}>
                      <div className={s.bubbleDot2}></div>
                    </div>
                    <div className={s.bubbleDot3Wrap}>
                      <div className={s.bubbleDot3}></div>
                    </div>
                  </div>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.avatar_url || FALLBACK_AVATAR}
                alt={member.display_name || member.name}
                className={s.avatar}
                style={{
                  borderColor: borderColor,
                  boxShadow: `0 0 20px ${glow}`,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                }}
              />
            </div>
            <CardTitle
              className={s.title}
              style={{ color: nameColor }}
            >
              {member.display_name || member.name}
            </CardTitle>
            {member.pronouns && (
              <p
                className={s.pronouns}
                style={{
                  color: pronounColor,
                }}
              >
                {member.pronouns}
              </p>
            )}
          </CardHeader>
          <CardContent className={s.content}>
            {member.description && (
              <div>
                <h3
                  className={s.sectionTitle}
                  style={{ color: nameColor }}
                >
                  About
                </h3>
                <p className={s.description}>{member.description}</p>
              </div>
            )}

            {member.tags && member.tags.length > 0 && (
              <div>
                <h3
                  className={s.sectionTitle}
                  style={{ color: nameColor }}
                >
                  Tags
                </h3>
                <div className={s.tagRow}>
                  {member.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      style={
                        memberColor
                          ? {
                              backgroundColor: `${memberColor}20`,
                              borderColor: memberColor,
                              color: memberColor,
                              borderWidth: "1px",
                            }
                          : undefined
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className={s.backWrap}>
              <Button
                variant="outline"
                asChild
                style={
                  memberColor
                    ? {
                        borderColor: memberColor,
                        color: memberColor,
                      }
                    : undefined
                }
              >
                <Link href="/">← Back to Members</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
