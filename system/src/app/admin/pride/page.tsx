/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useMembers,
  useSetMemberPride,
  type PluralMember,
} from "@doughmination/react-api";
import { PRIDE_FLAGS, findPrideFlag, prideSwatchGradient } from "@/lib/pride";
import * as s from "@/styles/admin.css";

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const PrideSwatch: React.FC<{ label: string }> = ({ label }) => {
  const flag = findPrideFlag(label);
  const background = flag
    ? prideSwatchGradient(flag.stripes)
    : "var(--accent)";
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.9rem",
        height: "0.9rem",
        borderRadius: "3px",
        background,
        border: "1px solid rgba(0,0,0,0.2)",
      }}
    />
  );
};

const PrideManager: React.FC = () => {
  const membersQuery = useMembers();
  const setPride = useSetMemberPride();

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((memberA, memberB) =>
      (memberA.display_name || memberA.name || "")
        .toLowerCase()
        .localeCompare((memberB.display_name || memberB.name || "").toLowerCase()),
    );
  }, [membersQuery.data]);

  const [selectedMember, setSelectedMember] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const getSelectedMember = (): PluralMember | undefined =>
    members.find((member) => member.name === selectedMember);

  const runChange = async (
    identifier: string,
    identity: string,
    action: "add" | "remove",
  ) => {
    setMessage(null);
    try {
      await setPride.mutateAsync({ identifier, identity, action });
      await membersQuery.refetch();
      setMessage({
        type: "success",
        content: action === "add" ? "Pride identity added!" : "Pride identity removed!",
      });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to update pride identity",
      });
    }
  };

  const selected = getSelectedMember();
  const selectedPride = selected?.pride ?? [];

  if (membersQuery.isLoading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Pride Manager</h1>
            <p className={s.pageSubtitle}>Assign pride identities to members</p>
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
            <CardTitle>Set Pride Identities</CardTitle>
            <CardDescription>Select a member, then toggle identities on or off</CardDescription>
          </CardHeader>
          <CardContent className={s.formStack}>
            <div className={s.fieldBlock}>
              <Label htmlFor="member-select">Select Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger id="member-select">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.name ?? ""}>
                      <div className={s.inlineRow}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar_url || FALLBACK_AVATAR}
                          alt={member.display_name || member.name}
                          className={s.memberAvatarSm}
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />
                        <span>{member.display_name || member.name}</span>
                        {member.pride && member.pride.length > 0 && (
                          <span className={s.smallMuted}>
                            ({member.pride.length})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selected && selectedPride.length > 0 && (
              <div className={s.statusBox}>
                <p className={s.smallMuted}>Current identities:</p>
                <div className={s.chipRow}>
                  {selectedPride.map((identity) => (
                    <span key={identity} className={s.chip}>
                      <PrideSwatch label={identity} />
                      <span style={{ margin: "0 0.35rem" }}>{identity}</span>
                      <button
                        type="button"
                        onClick={() => runChange(selected.name ?? "", identity, "remove")}
                        className={s.chipRemove}
                        title={`Remove ${identity}`}
                        disabled={setPride.isPending}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected && (
              <div className={s.fieldBlock}>
                <Label>Add an identity</Label>
                <div className={s.chipRow}>
                  {PRIDE_FLAGS.filter((flag) => !selectedPride.includes(flag.label)).map((flag) => (
                    <button
                      key={flag.label}
                      type="button"
                      onClick={() => runChange(selected.name ?? "", flag.label, "add")}
                      className={s.chip}
                      style={{ cursor: "pointer", border: "none" }}
                      disabled={setPride.isPending}
                    >
                      <PrideSwatch label={flag.label} />
                      <span style={{ marginLeft: "0.35rem" }}>{flag.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>
              {members.filter((member) => member.pride && member.pride.length > 0).length} member(s)
              with pride identities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={s.listStack}>
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member.name ?? "")}
                  className={s.memberRow}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.avatar_url || FALLBACK_AVATAR}
                    alt={member.display_name || member.name}
                    className={s.userAvatar}
                    onError={(event) => {
                      (event.target as HTMLImageElement).src = FALLBACK_AVATAR;
                    }}
                  />
                  <div className={s.userInfo}>
                    <p className={s.userName}>{member.display_name || member.name}</p>
                    {member.pride && member.pride.length > 0 ? (
                      <div className={s.chipRow} style={{ marginTop: "0.5rem" }}>
                        {member.pride.map((identity) => (
                          <span key={identity} className={s.chip}>
                            <PrideSwatch label={identity} />
                            <span style={{ marginLeft: "0.35rem" }}>{identity}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={s.smallMuted}>No pride identities</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function PrideManagerPage() {
  return (
    <ProtectedRoute ownerRequired>
      <PrideManager />
    </ProtectedRoute>
  );
}
