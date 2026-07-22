/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  useMembers,
  useDoughminationClient,
  isDoughminationError,
  type PluralMember,
} from "@doughmination/react-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/ProtectedRoute";
import * as s from "@/styles/admin.css";

type Member = PluralMember;

const EMOJI_SUGGESTIONS = [
  "💤", "🎮", "📚", "🎨", "🎵", "💻", "🌙", "☀️",
  "🍕", "☕", "🎬", "✨", "💭", "😴", "🏃", "🧘",
];

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

// The package client covers setting a status; clearing it uses a DELETE the
// client doesn't wrap, so this one endpoint is called inline.
async function deleteMemberStatus(baseUrl: string, identifier: string): Promise<void> {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${baseUrl}/plural/members/${encodeURIComponent(identifier)}/status`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || body?.error?.message || "Failed to clear status");
  }
}

function StatusManager() {
  const client = useDoughminationClient();
  const membersQuery = useMembers();

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((a, b) =>
      (a.display_name || a.name || "")
        .toLowerCase()
        .localeCompare((b.display_name || b.name || "").toLowerCase()),
    );
  }, [membersQuery.data]);

  const loading = membersQuery.isLoading;

  const [selectedMember, setSelectedMember] = useState<string>("");
  const [statusText, setStatusText] = useState("");
  const [emoji, setEmoji] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  useEffect(() => {
    if (selectedMember) {
      const member = members.find((m) => m.name === selectedMember);
      if (member?.status) {
        setStatusText(member.status.text);
        setEmoji(member.status.emoji || "");
      } else {
        setStatusText("");
        setEmoji("");
      }
    }
  }, [selectedMember, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      setMessage({ type: "error", content: "Please select a member" });
      return;
    }

    if (!statusText.trim()) {
      setMessage({ type: "error", content: "Status text is required" });
      return;
    }

    if (statusText.length > 100) {
      setMessage({ type: "error", content: "Status must be ≤ 100 chars" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await client.setMemberStatus(selectedMember, {
        text: statusText.trim(),
        emoji: emoji || undefined,
      });

      setMessage({ type: "success", content: "Status updated!" });
      await membersQuery.refetch();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: isDoughminationError(err) ? err.message : "Failed to update status",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearStatus = async () => {
    if (!selectedMember) {
      setMessage({ type: "error", content: "Please select a member" });
      return;
    }

    if (!window.confirm(`Clear status for ${selectedMember}?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      await deleteMemberStatus(client.baseUrl, selectedMember);

      setStatusText("");
      setEmoji("");
      setMessage({ type: "success", content: "Status cleared!" });
      await membersQuery.refetch();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to clear status",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStatus = () => {
    if (!selectedMember) return null;
    return members.find((m) => m.name === selectedMember)?.status;
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrapNarrow}>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Status Manager</h1>
            <p className={s.pageSubtitle}>Update member status messages</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/dash">Back to Dashboard</Link>
          </Button>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>Select a member and set their status</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={s.formStack}>
              {/* MEMBER SELECT */}
              <div className={s.fieldBlock}>
                <Label htmlFor="member-select">Select Member</Label>

                <Select name="member" value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger id="member-select">
                    <SelectValue placeholder="Choose a member..." />
                  </SelectTrigger>

                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.name ?? ""}>
                        <div className={s.inlineRow}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              member.avatar_url && member.avatar_url.trim() !== ""
                                ? member.avatar_url
                                : FALLBACK_AVATAR
                            }
                            alt={member.display_name || member.name}
                            className={s.memberAvatarSm}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                            }}
                          />
                          <span>{member.display_name || member.name}</span>
                          {member.status && <span className={s.smallMuted}>(has status)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMember && (
                <>
                  {/* EMOJI */}
                  <div className={s.fieldBlock}>
                    <Label>
                      Emoji (optional)
                      <div className={s.emojiPickerRow}>
                        <Input
                          id="emoji"
                          type="text"
                          value={emoji}
                          onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
                          placeholder="😊"
                          className={s.emojiInput}
                          maxLength={2}
                        />

                        <div className={s.emojiGrid}>
                          {EMOJI_SUGGESTIONS.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setEmoji(sug)}
                              aria-label={`Select emoji ${sug}`}
                              className={s.emojiButton}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* STATUS TEXT */}
                  <div className={s.fieldBlock}>
                    <Label htmlFor="statusText">Status Text</Label>

                    <Input
                      id="statusText"
                      type="text"
                      name="statusText"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="What's happening?"
                      maxLength={100}
                    />
                    <p className={s.smallMutedRight}>{statusText.length}/100 characters</p>
                  </div>

                  {/* BUTTONS */}
                  <div className={s.buttonRow}>
                    <Button type="submit" disabled={saving || !statusText.trim()} className={s.flexGrow}>
                      {saving ? "Updating..." : "Update Status"}
                    </Button>

                    {getCurrentStatus() && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleClearStatus}
                        disabled={saving}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* CURRENT STATUS */}
                  {getCurrentStatus() && (
                    <div className={s.statusBox}>
                      <p className={s.smallMuted}>Current Status:</p>

                      <div className={s.inlineRow}>
                        {getCurrentStatus()?.emoji && (
                          <span className={s.emojiLg}>{getCurrentStatus()?.emoji}</span>
                        )}
                        <p className={s.statusBoxText}>{getCurrentStatus()?.text}</p>
                      </div>

                      <p className={s.smallMuted}>
                        Updated {new Date(getCurrentStatus()!.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* MEMBERS WITH STATUS */}
        <Card>
          <CardHeader>
            <CardTitle>Members with Active Status</CardTitle>
            <CardDescription>
              {members.filter((m) => m.status).length} member(s) have status set
            </CardDescription>
          </CardHeader>

          <CardContent>
            {members.filter((m) => m.status).length > 0 ? (
              <div className={s.listStack}>
                {members
                  .filter((m) => m.status)
                  .map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member.name ?? "")}
                      className={s.memberRow}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          member.avatar_url && member.avatar_url.trim() !== ""
                            ? member.avatar_url
                            : FALLBACK_AVATAR
                        }
                        alt={member.display_name || member.name}
                        className={s.memberAvatarMd}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                        }}
                      />

                      <div className={s.userInfo}>
                        <p className={s.memberRowName}>{member.display_name || member.name}</p>

                        <div className={s.inlineRowTight}>
                          {member.status?.emoji && <span>{member.status.emoji}</span>}
                          <p className={`${s.smallMuted} ${s.truncate}`}>{member.status?.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className={s.emptyNote}>No members have status set</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StatusManagerPage() {
  return (
    <ProtectedRoute adminRequired>
      <StatusManager />
    </ProtectedRoute>
  );
}
