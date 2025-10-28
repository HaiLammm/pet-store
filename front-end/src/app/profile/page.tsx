"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Camera, Save, Mail, Calendar, Shield } from "lucide-react";
import Link from "next/link";
import { authAPI, handleAPIError, uploadsAPI } from "@/lib/axios";
import type { User } from "@/types/user";
import CenteredAlert, { type Banner } from "@/components/shared/CenteredAlert";
import { useAuth } from "@/hooks/useAuth";

// Only name and avatar are editable per backend contract
interface EditableProfile {
  name: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { requireAuth, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [edited, setEdited] = useState<EditableProfile>({ name: "" });
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authAPI.getProfile();
        const data = res.data as User;
        if (!mounted) return;
        setProfile(data);
        setEdited({ name: data.name || "", avatar: data.avatar });
      } catch (err) {
        setBanner({
          variant: "destructive",
          title: "Failed to load profile",
          message: handleAPIError(err),
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: edited.name,
        avatar: edited.avatar,
      });
      const updated = res.data as User;
      setProfile(updated);
      updateUser({ name: updated.name, avatar: updated.avatar });
      setIsEditing(false);
      setBanner({
        variant: "default",
        title: "Profile updated",
        message: "Your changes have been saved.",
      });
    } catch (err) {
      setBanner({
        variant: "destructive",
        title: "Update failed",
        message: handleAPIError(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (!profile) return;
    setEdited({ name: profile.name || "", avatar: profile.avatar });
    setIsEditing(false);
  };

  const pickAvatar = () => fileRef.current?.click();
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result);
        try {
          const res = await uploadsAPI.uploadBase64(dataUrl, "avatars");
          const url = (res.data as { url: string }).url;
          setEdited((p) => ({ ...p, avatar: url }));
          setBanner({ variant: "default", title: "Avatar uploaded" });
        } catch (err) {
          setBanner({
            variant: "destructive",
            title: "Avatar upload failed",
            message: handleAPIError(err),
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setBanner({
        variant: "destructive",
        title: "Avatar upload failed",
        message: handleAPIError(err),
      });
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <CenteredAlert banner={banner} onClose={() => setBanner(null)} />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 border-4 border-border shadow-md">
                  <AvatarImage
                    src={(isEditing ? edited.avatar : profile?.avatar) || ""}
                    alt={profile?.name || "User avatar"}
                  />
                  <AvatarFallback className="bg-muted text-foreground font-semibold text-xl">
                    {(profile?.name?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -bottom-2 -right-2 rounded-full bg-card shadow-md hover:bg-muted border border-border"
                  onClick={pickAvatar}
                >
                  <Camera size={16} className="text-muted-foreground" />
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload avatar image"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </div>
              <CardTitle className="text-xl">
                {profile?.name || (loading ? "" : "Unnamed")}
              </CardTitle>
              <p className="text-sky-600 font-medium">{profile?.role}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-foreground/90">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-foreground/90">
                  Joined{" "}
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={16} className="text-muted-foreground" />
                <span className="text-foreground/90">
                  {profile?.role === "admin"
                    ? "Administrator Access"
                    : "Customer"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="border-border hover:bg-muted"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Save size={16} className="mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={isEditing ? edited.name : profile?.name || ""}
                      onChange={(e) =>
                        setEdited((p) => ({ ...p, name: e.target.value }))
                      }
                      disabled={!isEditing}
                      className="disabled:bg-muted/40"
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="disabled:bg-muted/40"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information (not available) */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Address Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Address details are not available in your account yet.
                  </p>
                </div>

                <Separator />

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">
                        Role
                      </Label>
                      <Input
                        id="role"
                        value={profile?.role || ""}
                        disabled
                        className="disabled:bg-muted/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate" className="text-sm font-medium">
                        Join Date
                      </Label>
                      <Input
                        id="joinDate"
                        value={
                          profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString()
                            : ""
                        }
                        disabled
                        className="disabled:bg-muted/40"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings Card */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border hover:bg-muted"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border hover:bg-muted"
                >
                  Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border hover:bg-muted"
                >
                  Login History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
