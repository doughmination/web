/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  useMembers,
  useFronters,
  useDoughminationClient,
  isDoughminationError,
  type PluralMember,
} from "@doughmination/react-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";
import * as s from "@/styles/admin.css";
import * as sw from "./switch.css";

type Member = PluralMember;

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const SwitchManager: React.FC = () => {
  const client = useDoughminationClient();
  const membersQuery = useMembers();
  const frontersQuery = useFronters();

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((a, b) =>
      (a.display_name || a.name || "")
        .toLowerCase()
        .localeCompare((b.display_name || b.name || "").toLowerCase()),
    );
  }, [membersQuery.data]);

  const currentFronters = frontersQuery.data?.members ?? [];
  const loading = membersQuery.isLoading || frontersQuery.isLoading;

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  // Pre-populate the selection with the current fronters, once.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && frontersQuery.data) {
      seeded.current = true;
      setSelectedMembers(new Set(frontersQuery.data.members?.map((member) => member.id) || []));
    }
  }, [frontersQuery.data]);

  const handleToggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);

    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }

    setSelectedMembers(newSelected);
  };

  const handleApplySwitch = async () => {
    if (selectedMembers.size === 0) {
      setMessage({ type: "error", content: "Please select at least one member" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const data = await client.multiSwitch(Array.from(selectedMembers));
      const count = data.count ?? selectedMembers.size;
      setMessage({
        type: "success",
        content: `Successfully switched to ${count} member${count !== 1 ? "s" : ""}!`,
      });

      // Refresh fronters (also arrives live over the socket).
      await frontersQuery.refetch();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: isDoughminationError(err) ? err.message : "Failed to switch fronters",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.display_name || m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSelectAll = () => {
    const allMemberIds = new Set(filteredMembers.map((m) => m.id));
    setSelectedMembers(allMemberIds);
  };

  const handleClearAll = () => {
    setSelectedMembers(new Set());
  };

  const isCurrentlyFronting = (memberId: string): boolean => {
    return currentFronters.some((f) => f.id === memberId);
  };

  const getSelectedMembersList = () => {
    return members.filter((m) => selectedMembers.has(m.id));
  };

  const hasChanges = () => {
    // Compare current fronters with selected members
    const currentIds = new Set(currentFronters.map((m) => m.id));

    if (currentIds.size !== selectedMembers.size) return true;

    for (const id of selectedMembers) {
      if (!currentIds.has(id)) return true;
    }

    return false;
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
      <div className={sw.wrapWide}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Switch Manager</h1>
            <p className={s.pageSubtitle}>Manage fronting members</p>
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

        <div className={sw.columns}>
          {/* Left Column - Member Selection */}
          <div className={sw.colStack}>
            {/* Search and Actions */}
            <Card>
              <CardContent className={cn(s.cardTopPad, s.formStack)}>
                <Input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className={sw.searchActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={filteredMembers.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={selectedMembers.size === 0}
                  >
                    Clear All
                  </Button>
                  <div className={sw.selectedCount}>{selectedMembers.size} selected</div>
                </div>
              </CardContent>
            </Card>

            {/* Member List */}
            <Card>
              <CardHeader>
                <CardTitle>Select Members</CardTitle>
                <CardDescription>Choose members to front</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMembers.length > 0 ? (
                  <div className={sw.memberScroll}>
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMembers.has(member.id);
                      const isFronting = isCurrentlyFronting(member.id);

                      return (
                        <div
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={cn(sw.memberOption, isSelected && sw.memberOptionSelected)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMember(member.id)}
                            onClick={(e) => e.stopPropagation()}
                          />

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.avatar_url || FALLBACK_AVATAR}
                            alt={member.display_name || member.name}
                            className={s.memberAvatarMd}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                            }}
                          />

                          <div className={s.userInfo}>
                            <div className={s.userNameRow}>
                              <p className={s.userName}>{member.display_name || member.name}</p>
                              {isFronting && (
                                <Badge variant="secondary" className={s.smallBadge}>
                                  Currently Fronting
                                </Badge>
                              )}
                            </div>
                            {member.pronouns && (
                              <p className={s.smallMuted}>{member.pronouns}</p>
                            )}
                            {member.tags && member.tags.length > 0 && (
                              <div className={sw.tagRow}>
                                {member.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className={sw.tagChip}>
                                    {tag}
                                  </span>
                                ))}
                                {member.tags.length > 3 && (
                                  <span className={s.smallMuted}>+{member.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={s.emptyNote}>
                    {searchQuery ? "No members found matching your search" : "No members available"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Members & Apply */}
          <div className={sw.colStack}>
            {/* Currently Fronting */}
            <Card>
              <CardHeader>
                <CardTitle>Currently Fronting</CardTitle>
              </CardHeader>
              <CardContent>
                {currentFronters.length > 0 ? (
                  <div className={sw.sideList}>
                    {currentFronters.map((member) => (
                      <div key={member.id} className={sw.sideRow}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar_url || FALLBACK_AVATAR}
                          alt={member.display_name || member.name}
                          className={sw.sideAvatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />
                        <span className={sw.sideName}>{member.display_name || member.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={s.emptyNote}>No one currently fronting</p>
                )}
              </CardContent>
            </Card>

            {/* Selected Members */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Members</CardTitle>
                <CardDescription>
                  {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""} selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMembers.size > 0 ? (
                  <div className={sw.sideList}>
                    {getSelectedMembersList().map((member) => (
                      <div key={member.id} className={sw.sideRow}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar_url || FALLBACK_AVATAR}
                          alt={member.display_name || member.name}
                          className={sw.sideAvatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />
                        <span className={sw.sideName}>{member.display_name || member.name}</span>
                        <button
                          onClick={() => handleToggleMember(member.id)}
                          className={sw.removeBtn}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={s.emptyNote}>No members selected</p>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Button
              onClick={handleApplySwitch}
              disabled={saving || selectedMembers.size === 0 || !hasChanges()}
              className={s.fullWidth}
              size="lg"
            >
              {saving ? "Switching..." : hasChanges() ? "Apply Switch" : "No Changes"}
            </Button>

            {!hasChanges() && selectedMembers.size > 0 && (
              <p className={sw.centerNoteXs}>Selected members match current fronters</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SwitchManagerPage() {
  return (
    <ProtectedRoute adminRequired>
      <SwitchManager />
    </ProtectedRoute>
  );
}
