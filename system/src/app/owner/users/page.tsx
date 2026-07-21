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
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_BASE, authHeaders, errorMessage, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";
import * as s from "@/styles/admin.css";

interface User {
  id: string;
  username: string;
  display_name?: string;
  is_admin: boolean;
  is_owner?: boolean;
  is_pet?: boolean;
  avatar_url?: string;
}

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newIsPet, setNewIsPet] = useState(false);

  // Per-user edit panel state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsPet, setEditIsPet] = useState(false);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: authHeaders(token),
      });

      if (response.ok) {
        const data = unwrap<User[]>(await response.json());
        setUsers([...data].sort((a, b) => a.username.localeCompare(b.username)));
      } else {
        setMessage({ type: "error", content: "Failed to fetch users" });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ type: "error", content: "Network error occurred" });
    }
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/user_info`, {
          headers: authHeaders(token),
        });

        if (response.ok) {
          const data = unwrap(await response.json());
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    const initialize = async () => {
      await Promise.all([fetchUsers(), fetchCurrentUser()]);
      setLoading(false);
    };

    initialize();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim()) {
      setMessage({ type: "error", content: "Username and password are required" });
      return;
    }

    if (newPassword.length < 10) {
      setMessage({ type: "error", content: "Password must be at least 10 characters" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          display_name: newDisplayName.trim() || undefined,
          is_admin: newIsAdmin,
          is_pet: newIsPet,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to create user"));
      }

      setMessage({ type: "success", content: "User created successfully!" });
      setNewUsername("");
      setNewPassword("");
      setNewDisplayName("");
      setNewIsAdmin(false);
      setNewIsPet(false);
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to create user",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditDisplayName(user.display_name || "");
    setEditAvatarUrl(user.avatar_url || "");
    setEditIsAdmin(!!user.is_admin);
    setEditIsPet(!!user.is_pet);
    setMessage(null);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const handleSaveUser = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          // null explicitly clears the field on the API; a value sets it
          display_name: editDisplayName.trim() || null,
          avatar_url: editAvatarUrl.trim() || null,
          is_admin: editIsAdmin,
          is_pet: editIsPet,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to update user"));
      }

      setMessage({ type: "success", content: `Updated @${user.username} successfully!` });
      setEditingUserId(null);
      await fetchUsers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === currentUserId) {
      setMessage({ type: "error", content: "Cannot delete your own account" });
      return;
    }

    if (!window.confirm(`Delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setMessage({ type: "error", content: "Authentication required" });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to delete user"));
      }

      setMessage({ type: "success", content: "User deleted successfully!" });
      await fetchUsers();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setSaving(false);
    }
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
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>User Manager</h1>
            <p className={s.pageSubtitle}>Manage system users, roles and permissions</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/owner/dash">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Create User Button */}
        {!showCreateForm && (
          <Card>
            <CardContent className={s.cardTopPad}>
              <Button onClick={() => setShowCreateForm(true)} className={s.fullWidth}>
                + Create New User
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className={s.formStack}>
                <div className={s.fieldBlock}>
                  <Label htmlFor="new-username">Username *</Label>
                  <Input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    disabled={saving}
                  />
                </div>

                <div className={s.fieldBlock}>
                  <Label htmlFor="new-password">Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password (min 10 characters)"
                    disabled={saving}
                  />
                </div>

                <div className={s.fieldBlock}>
                  <Label htmlFor="new-display-name">Display Name</Label>
                  <Input
                    id="new-display-name"
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Optional display name"
                    disabled={saving}
                  />
                </div>

                <div className={s.checkboxRow}>
                  <Checkbox
                    id="new-is-admin"
                    checked={newIsAdmin}
                    onCheckedChange={(checked) => setNewIsAdmin(checked as boolean)}
                    disabled={saving}
                  />
                  <Label htmlFor="new-is-admin" className={s.checkboxLabel}>
                    Admin privileges
                  </Label>
                </div>

                <div className={s.checkboxRow}>
                  <Checkbox
                    id="new-is-pet"
                    checked={newIsPet}
                    onCheckedChange={(checked) => setNewIsPet(checked as boolean)}
                    disabled={saving}
                  />
                  <Label htmlFor="new-is-pet" className={s.checkboxLabel}>
                    Pet role
                  </Label>
                </div>

                <div className={s.buttonRow}>
                  <Button type="submit" disabled={saving} className={s.flexGrow}>
                    {saving ? "Creating..." : "Create User"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewUsername("");
                      setNewPassword("");
                      setNewDisplayName("");
                      setNewIsAdmin(false);
                      setNewIsPet(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users.length} user{users.length !== 1 ? "s" : ""} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className={s.listStack}>
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const isEditing = editingUserId === user.id;

                  return (
                    <React.Fragment key={user.id}>
                      <div className={cn(s.userRow, isCurrentUser && s.userRowCurrent)}>
                        {/* Avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatar_url || FALLBACK_AVATAR}
                          alt={user.display_name || user.username}
                          className={s.userAvatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />

                        {/* User Info */}
                        <div className={s.userInfo}>
                          <div className={s.userNameRow}>
                            <p className={s.userName}>{user.display_name || user.username}</p>
                            {user.is_owner && (
                              <Badge variant="default" className={s.smallBadge}>
                                Owner
                              </Badge>
                            )}
                            {user.is_admin && (
                              <Badge variant="destructive" className={s.smallBadge}>
                                Admin
                              </Badge>
                            )}
                            {user.is_pet && (
                              <Badge variant="default" className={s.smallBadge}>
                                Pet
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge variant="secondary" className={s.smallBadge}>
                                You
                              </Badge>
                            )}
                          </div>
                          <p className={s.userHandle}>@{user.username}</p>
                        </div>

                        {/* Actions */}
                        <div className={s.buttonRow}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (isEditing ? cancelEditing() : startEditing(user))}
                            disabled={saving}
                          >
                            {isEditing ? "Close" : "Edit"}
                          </Button>
                          {!isCurrentUser && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={saving}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Edit Panel — roles, display name, avatar URL */}
                      {isEditing && (
                        <div className={s.editPanel}>
                          <div className={s.fieldBlock}>
                            <Label htmlFor={`edit-display-${user.id}`}>Display Name</Label>
                            <Input
                              id={`edit-display-${user.id}`}
                              type="text"
                              value={editDisplayName}
                              onChange={(e) => setEditDisplayName(e.target.value)}
                              placeholder="Display name"
                              disabled={saving}
                            />
                          </div>

                          <div className={s.fieldBlock}>
                            <Label htmlFor={`edit-avatar-${user.id}`}>Avatar URL</Label>
                            <Input
                              id={`edit-avatar-${user.id}`}
                              type="url"
                              value={editAvatarUrl}
                              onChange={(e) => setEditAvatarUrl(e.target.value)}
                              placeholder="https://example.com/avatar.png"
                              disabled={saving}
                            />
                            <p className={s.helpText}>
                              Avatars are external image links — no uploads
                            </p>
                          </div>

                          <div className={s.checkboxRow}>
                            <Checkbox
                              id={`edit-admin-${user.id}`}
                              checked={editIsAdmin}
                              onCheckedChange={(checked) => setEditIsAdmin(checked as boolean)}
                              disabled={saving}
                            />
                            <Label htmlFor={`edit-admin-${user.id}`} className={s.checkboxLabel}>
                              Admin privileges
                            </Label>
                          </div>

                          <div className={s.checkboxRow}>
                            <Checkbox
                              id={`edit-pet-${user.id}`}
                              checked={editIsPet}
                              onCheckedChange={(checked) => setEditIsPet(checked as boolean)}
                              disabled={saving}
                            />
                            <Label htmlFor={`edit-pet-${user.id}`} className={s.checkboxLabel}>
                              Pet role
                            </Label>
                          </div>

                          <div className={s.buttonRow}>
                            <Button
                              onClick={() => handleSaveUser(user)}
                              disabled={saving}
                              className={s.flexGrow}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <p className={s.emptyNote}>No users found</p>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={s.statsGrid}>
              <div className={s.statBox}>
                <p className={s.statLabel}>Total Users</p>
                <p className={s.statValue}>{users.length}</p>
              </div>
              <div className={s.statBox}>
                <p className={s.statLabel}>Admins</p>
                <p className={s.statValue}>{users.filter((u) => u.is_admin).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function UserManagerPage() {
  return (
    <ProtectedRoute ownerRequired>
      <UserManager />
    </ProtectedRoute>
  );
}
