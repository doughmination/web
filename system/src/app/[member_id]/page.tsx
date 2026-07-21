/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { unwrap } from "@/lib/api";
import { normalizeColor, readableOnDark } from "@/lib/utils";
import * as s from "./member.css";

interface Member {
  id: string;
  name: string;
  display_name?: string;
  avatar_url?: string;
  pronouns?: string;
  description?: string;
  color?: string | null;
  tags?: string[];
  status?: {
    text: string;
    emoji?: string;
    updated_at: string;
  } | null;
}

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

export default function MemberDetails() {
  const params = useParams<{ member_id: string }>();
  const member_id = params?.member_id;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!member_id) {
        setError("No member ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching member data for:", member_id);

        // Fetch member basic info
        const response = await fetch(`https://doughmination.uk/v2/plural/member/${member_id}`);
        if (!response.ok) {
          throw new Error("Member not found");
        }
        const memberData = unwrap(await response.json());
        console.log("Member data received:", memberData);

        // Fetch member status separately
        try {
          const statusResponse = await fetch(
            `https://doughmination.uk/v2/plural/members/${member_id}/status`,
          );
          if (statusResponse.ok) {
            const statusData = unwrap(await statusResponse.json());
            console.log("Status data received:", statusData);
            if (statusData.success && statusData.status) {
              memberData.status = statusData.status;
            }
          }
        } catch (statusErr) {
          console.log("No status found for member:", statusErr);
          // Not an error - member just doesn't have a status
        }

        setMember(memberData);
      } catch (err) {
        console.error("Error fetching member:", err);
        setError("Member not found or error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [member_id]);

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
