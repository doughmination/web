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
import { Input } from "@/components/ui/input";
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
  useRelationships,
  useAddRelationship,
  useRemoveRelationship,
  type PluralMember,
} from "@doughmination/react-api";
import * as s from "@/styles/admin.css";

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const RELATIONSHIP_TYPES = ["partner", "spouse", "queerplatonic", "datemate", "crush"];

const RelationshipManager: React.FC = () => {
  const membersQuery = useMembers();
  const relationshipsQuery = useRelationships();
  const addRelationship = useAddRelationship();
  const removeRelationship = useRemoveRelationship();

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((memberA, memberB) =>
      (memberA.display_name || memberA.name || "")
        .toLowerCase()
        .localeCompare((memberB.display_name || memberB.name || "").toLowerCase()),
    );
  }, [membersQuery.data]);

  const memberById = useMemo(() => {
    const lookup = new Map<string, PluralMember>();
    for (const member of members) {
      if (member.id) lookup.set(member.id, member);
      if (member.name) lookup.set(member.name, member);
    }
    return lookup;
  }, [members]);

  const relationships = relationshipsQuery.data?.relationships ?? [];

  const [memberA, setMemberA] = useState<string>("");
  const [memberB, setMemberB] = useState<string>("");
  const [type, setType] = useState<string>("partner");
  const [since, setSince] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const labelFor = (identifier: string): string => {
    const member = memberById.get(identifier);
    return member?.display_name || member?.name || identifier;
  };

  const handleAdd = async () => {
    setMessage(null);
    if (!memberA || !memberB) {
      setMessage({ type: "error", content: "Pick two members" });
      return;
    }
    if (memberA === memberB) {
      setMessage({ type: "error", content: "Pick two different members" });
      return;
    }
    try {
      await addRelationship.mutateAsync({
        memberA,
        memberB,
        type,
        since: since || null,
      });
      setMemberA("");
      setMemberB("");
      setSince("");
      setType("partner");
      setMessage({ type: "success", content: "Relationship added!" });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to add relationship",
      });
    }
  };

  const handleRemove = async (id: string, pairLabel: string) => {
    if (!window.confirm(`Remove the relationship between ${pairLabel}?`)) return;
    setMessage(null);
    try {
      await removeRelationship.mutateAsync(id);
      setMessage({ type: "success", content: "Relationship removed!" });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to remove relationship",
      });
    }
  };

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
            <h1 className={s.pageTitle}>Relationship Manager</h1>
            <p className={s.pageSubtitle}>Map who is dating who across the system</p>
          </div>
          <div className={s.inlineRow}>
            <Button variant="outline" asChild>
              <Link href="/relationships">View Map</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/dash">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add Relationship</CardTitle>
            <CardDescription>Link two members. A member can have many.</CardDescription>
          </CardHeader>
          <CardContent className={s.formStack}>
            <div className={s.fieldBlock}>
              <Label htmlFor="member-a">First Member</Label>
              <Select value={memberA} onValueChange={setMemberA}>
                <SelectTrigger id="member-a">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.display_name || member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={s.fieldBlock}>
              <Label htmlFor="member-b">Second Member</Label>
              <Select value={memberB} onValueChange={setMemberB}>
                <SelectTrigger id="member-b">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.display_name || member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={s.fieldBlock}>
              <Label htmlFor="rel-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="rel-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={s.fieldBlock}>
              <Label htmlFor="rel-since">Since (optional)</Label>
              <Input
                id="rel-since"
                type="date"
                value={since}
                onChange={(event) => setSince(event.target.value)}
              />
            </div>

            <Button
              onClick={handleAdd}
              disabled={addRelationship.isPending || !memberA || !memberB}
              className={s.fullWidth}
            >
              {addRelationship.isPending ? "Adding..." : "Add Relationship"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Relationships</CardTitle>
            <CardDescription>
              {relationships.length} link{relationships.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relationships.length > 0 ? (
              <div className={s.listStack}>
                {relationships.map((edge) => {
                  const pairLabel = `${labelFor(edge.members[0])} & ${labelFor(edge.members[1])}`;
                  return (
                    <div key={edge.id} className={s.memberRow}>
                      <div className={s.userInfo}>
                        <p className={s.userName}>{pairLabel}</p>
                        <p className={s.smallMuted}>
                          {edge.type}
                          {edge.since ? ` · since ${edge.since}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleRemove(edge.id, pairLabel)}
                        disabled={removeRelationship.isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={s.emptyNote}>No relationships yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function RelationshipManagerPage() {
  return (
    <ProtectedRoute ownerRequired>
      <RelationshipManager />
    </ProtectedRoute>
  );
}
