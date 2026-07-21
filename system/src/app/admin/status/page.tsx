/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { API_BASE, authHeaders, errorMessage, unwrap } from "@/lib/api";
import * as s from "@/styles/admin.css";

interface Member {
  id: string;
  name: string;
  display_name?: string;
  avatar_url?: string;
  status?: {
    text: string;
    emoji?: string;
    updated_at: string;
  } | null;
}

const EMOJI_SUGGESTIONS = [
  "💤", "🎮", "📚", "🎨", "🎵", "💻", "🌙", "☀️",
  "🍕", "☕", "🎬", "✨", "💭", "😴", "🏃", "🧘",
];

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

function StatusManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [statusText, setStatusText] = useState("");
  const [emoji, setEmoji] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const fetchMembers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/members`, {
        headers: authHeaders(token),
      });

      if (response.ok) {
        const data = unwrap<Member[]>(await response.json());
        const regularMembers = [...data].sort((a, b) =>
          (a.display_name || a.name)
            .toLowerCase()
            .localeCompare((b.display_name || b.name).toLowerCase()),
        );

        setMembers(regularMembers);
      } else {
        setMessage({ type: "error", content: "Failed to fetch members" });
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setMessage({ type: "error", content: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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

    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/members/${selectedMember}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          text: statusText.trim(),
          emoji: emoji || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to update status"));
      }

      setMessage({ type: "success", content: "Status updated!" });
      await fetchMembers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to update status",
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

    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    if (!window.confirm(`Clear status for ${selectedMember}?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/members/${selectedMember}/status`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to clear status"));
      }

      setStatusText("");
      setEmoji("");
      setMessage({ type: "success", content: "Status cleared!" });
      await fetchMembers();
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
                      <SelectItem key={member.id} value={member.name}>
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
                      onClick={() => setSelectedMember(member.name)}
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
