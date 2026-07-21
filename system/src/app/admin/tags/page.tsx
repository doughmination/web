/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  tags?: string[];
}

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const TagManager: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique tags from all members
  const allTags = Array.from(new Set(members.flatMap((m) => m.tags || []))).sort((a, b) =>
    a.localeCompare(b),
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

  const handleAddTag = async () => {
    if (!selectedMember) {
      setMessage({ type: "error", content: "Please select a member" });
      return;
    }

    if (!newTag.trim()) {
      setMessage({ type: "error", content: "Tag cannot be empty" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/member-tags/${selectedMember}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({ tag: newTag.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to add tag"));
      }

      setNewTag("");
      setMessage({ type: "success", content: "Tag added successfully!" });
      await fetchMembers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to add tag",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTag = async (memberName: string, tag: string) => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    if (!window.confirm(`Remove tag "${tag}" from ${memberName}?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE}/member-tags/${memberName}/${encodeURIComponent(tag)}`,
        {
          method: "DELETE",
          headers: authHeaders(token),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to remove tag"));
      }

      setMessage({ type: "success", content: "Tag removed successfully!" });
      await fetchMembers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to remove tag",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedMember = () => {
    return members.find((m) => m.name === selectedMember);
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.display_name || m.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Tag Manager</h1>
            <p className={s.pageSubtitle}>Manage member tags and sub-systems</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/dash">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Add Tag Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Tag</CardTitle>
            <CardDescription>Select a member and add a tag</CardDescription>
          </CardHeader>
          <CardContent className={s.formStack}>
            {/* Member Selection */}
            <div className={s.fieldBlock}>
              <Label htmlFor="member-select">Select Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger id="member-select">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className={s.inlineRow}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar_url || FALLBACK_AVATAR}
                          alt={member.display_name || member.name}
                          className={s.memberAvatarSm}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />
                        <span>{member.display_name || member.name}</span>
                        {member.tags && member.tags.length > 0 && (
                          <span className={s.smallMuted}>
                            ({member.tags.length} tag{member.tags.length !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Tags Display */}
            {selectedMember && getSelectedMember() && (
              <div className={s.statusBox}>
                <p className={s.smallMuted}>Current Tags:</p>
                {getSelectedMember()?.tags && getSelectedMember()!.tags!.length > 0 ? (
                  <div className={s.chipRow}>
                    {getSelectedMember()!.tags!.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className={s.smallBadge}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className={s.smallMuted}>No tags assigned</p>
                )}
              </div>
            )}

            {/* New Tag Input */}
            {selectedMember && (
              <>
                <div className={s.fieldBlock}>
                  <Label htmlFor="new-tag">New Tag</Label>
                  <Input
                    id="new-tag"
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                </div>

                {/* Existing Tags Quick Add */}
                {allTags.length > 0 && (
                  <div className={s.fieldBlock}>
                    <Label>Or select from existing tags:</Label>
                    <div className={s.chipRow}>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewTag(tag)}
                          className={s.chip}
                          style={{ cursor: "pointer", border: "none" }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleAddTag} disabled={saving || !newTag.trim()} className={s.fullWidth}>
                  {saving ? "Adding..." : "Add Tag"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* All Members with Tags */}
        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>
              {members.filter((m) => m.tags && m.tags.length > 0).length} member(s) with tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div style={{ marginBottom: "1rem" }}>
              <Input
                type="text"
                placeholder="Search members or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Members List */}
            {filteredMembers.length > 0 ? (
              <div className={s.listStack}>
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member.name)}
                    className={s.memberRow}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar_url || FALLBACK_AVATAR}
                      alt={member.display_name || member.name}
                      className={s.userAvatar}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                      }}
                    />

                    <div className={s.userInfo}>
                      <p className={s.userName}>{member.display_name || member.name}</p>

                      {member.tags && member.tags.length > 0 ? (
                        <div className={s.chipRow} style={{ marginTop: "0.5rem" }}>
                          {member.tags.map((tag, idx) => (
                            <span key={idx} className={s.chip}>
                              {tag}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTag(member.name, tag);
                                }}
                                className={s.chipRemove}
                                title={`Remove ${tag}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className={s.smallMuted}>No tags</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={s.emptyNote}>
                {searchQuery ? "No members found matching your search" : "No members available"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tag Statistics */}
        {allTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tag Statistics</CardTitle>
              <CardDescription>
                {allTags.length} unique tag{allTags.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={s.chipRow}>
                {allTags.map((tag) => {
                  const count = members.filter((m) => m.tags?.includes(tag)).length;
                  return (
                    <div key={tag} className={s.statBox} style={{ padding: "0.5rem 0.75rem" }}>
                      <Badge variant="secondary" className={s.smallBadge}>
                        {tag}
                      </Badge>{" "}
                      <span className={s.smallMuted}>×{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default function TagManagerPage() {
  return (
    <ProtectedRoute adminRequired>
      <TagManager />
    </ProtectedRoute>
  );
}
