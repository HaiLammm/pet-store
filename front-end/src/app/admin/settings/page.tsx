/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CenteredAlert, { type Banner } from "@/components/shared/CenteredAlert";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { handleAPIError, petsAPI, settingsAPI, uploadsAPI } from "@/lib/axios";

type PageKey = "home" | "kings" | "queens" | "kittens";
type HeroSection = { title?: string; subtitle?: string; images?: string[] };
type Section = {
  _id?: string;
  title?: string;
  contentHtml?: string;
  order?: number;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
};
type About = { title?: string; content?: string; images?: string[] };
type Contact = {
  email?: string;
  phone?: string;
  address?: string;
  imessage?: string;
  mapEmbed?: string;
  content?: string;
};
type Settings = {
  siteName?: string;
  hero?: Partial<Record<PageKey, HeroSection>>;
  about?: About;
  contact?: Contact;
  sections?: Section[];
  featuredPetIds?: string[];
  featuredPosition?: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [selectedPage, setSelectedPage] = useState<PageKey>("home");

  // Featured UI state
  const [petLabels, setPetLabels] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<
    Array<{ _id: string; name: string; breed?: string }>
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const featuredPos = useMemo(() => {
    const total = (settings.sections?.length || 0) + 1;
    return clamp(settings.featuredPosition || 1, 1, total);
  }, [settings.featuredPosition, settings.sections]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await settingsAPI.get();
        if (!mounted) return;
        const data = (res.data?.data ?? res.data) as Partial<Settings>;
        const normalized: Settings = {
          siteName: data.siteName || "",
          hero: data.hero || {},
          about: data.about || {},
          contact: data.contact || {},
          sections: (data.sections || []).map((x, i) => ({
            _id: (x as any)._id,
            title: x.title || "",
            contentHtml: x.contentHtml || "",
            order: x.order ?? i + 1,
            bgColor: x.bgColor || "#ffffff",
            textColor: x.textColor || "#111827",
            fontSize: x.fontSize ?? 16,
          })),
          featuredPetIds: data.featuredPetIds || [],
          featuredPosition: clamp(
            data.featuredPosition ?? 1,
            1,
            (data.sections?.length || 0) + 1
          ),
        };
        setSettings(normalized);
      } catch (err) {
        setBanner({
          variant: "destructive",
          title: "Failed to load settings",
          message: handleAPIError(err),
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setSiteName = (v: string) =>
    setSettings((s) => ({ ...(s || {}), siteName: v }));
  const setFeatured = (ids: string[]) =>
    setSettings((s) => ({ ...(s || {}), featuredPetIds: ids }));
  const setHero = (partial: Partial<HeroSection>) =>
    setSettings((s) => ({
      ...(s || {}),
      hero: {
        ...(s.hero || {}),
        [selectedPage]: { ...(s.hero?.[selectedPage] || {}), ...partial },
      },
    }));
  const setAbout = (partial: Partial<About>) =>
    setSettings((s) => ({
      ...(s || {}),
      about: { ...(s.about || {}), ...partial },
    }));
  const setContact = (partial: Partial<Contact>) =>
    setSettings((s) => ({
      ...(s || {}),
      contact: { ...(s.contact || {}), ...partial },
    }));

  const save = async () => {
    try {
      setSaving(true);
      const payload: Settings = {
        ...settings,
        featuredPosition: featuredPos,
        contact: (() => {
          const c = settings.contact || {};
          if (!c.mapEmbed && c.address) {
            const q = encodeURIComponent(c.address);
            const iframe = `<iframe src="https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&iwloc=&output=embed" width=\"100%\" height=\"300\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>`;
            return { ...c, mapEmbed: iframe };
          }
          return c;
        })(),
      };
      await settingsAPI.update(payload);
      setBanner({ variant: "default", title: "Saved settings" });
    } catch (err) {
      setBanner({
        variant: "destructive",
        title: "Failed to save settings",
        message: handleAPIError(err),
      });
    } finally {
      setSaving(false);
    }
  };

  // uploads
  const addMultipleHeroImages = async (files: FileList) => {
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await uploadsAPI.uploadBase64(dataUrl, "hero");
        uploaded.push(res.data.url || res.data.secure_url || res.data);
      }
      setHero({
        images: [
          ...((settings.hero || {})[selectedPage]?.images || []),
          ...uploaded,
        ],
      });
      setBanner({
        variant: "default",
        title: `Uploaded ${uploaded.length} image(s)`,
      });
    } catch (err) {
      setBanner({
        variant: "destructive",
        title: "Failed to upload images",
        message: handleAPIError(err),
      });
    }
  };
  const moveHeroImage = (from: number, to: number) => {
    setSettings((s) => {
      const hs = { ...(s.hero || {}) } as Partial<Record<PageKey, HeroSection>>;
      const arr = [...(hs[selectedPage]?.images || [])];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      hs[selectedPage] = { ...(hs[selectedPage] || {}), images: arr };
      return { ...(s || {}), hero: hs } as Settings;
    });
  };
  const removeHeroImageAt = (idx: number) => {
    setSettings((s) => {
      const hs = { ...(s.hero || {}) } as Partial<Record<PageKey, HeroSection>>;
      const arr = [...(hs[selectedPage]?.images || [])];
      arr.splice(idx, 1);
      hs[selectedPage] = { ...(hs[selectedPage] || {}), images: arr };
      return { ...(s || {}), hero: hs } as Settings;
    });
  };
  const addAboutImages = async (files: FileList) => {
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const b64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(f);
        });
        const res = await uploadsAPI.uploadBase64(b64, "about");
        urls.push(res.data.url || res.data.secure_url || res.data);
      }
      setAbout({ images: [...(settings.about?.images || []), ...urls] });
      setBanner({
        variant: "default",
        title: `Uploaded ${urls.length} image(s)`,
      });
    } catch (err) {
      setBanner({
        variant: "destructive",
        title: "Failed to upload images",
        message: handleAPIError(err),
      });
    }
  };
  const removeAboutImage = (idx: number) =>
    setAbout({
      images: (settings.about?.images || []).filter((_, i) => i !== idx),
    });

  useEffect(() => {
    if (!dropdownOpen || options.length > 0) return;
    let active = true;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await petsAPI.getAll({
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        if (!active) return;
        const items: Array<{ _id: string; name: string; breed?: string }> = (res
          .data.items ?? res.data) as Array<{
          _id: string;
          name: string;
          breed?: string;
        }>;
        setOptions(items);
        setPetLabels((prev) => {
          const next = { ...prev } as Record<string, string>;
          items.forEach((p) => {
            next[p._id] = p.breed ? `${p.name} (${p.breed})` : p.name;
          });
          return next;
        });
      } catch (err) {
        setBanner({
          variant: "destructive",
          title: "Failed to load pets",
          message: handleAPIError(err),
        });
      } finally {
        setOptionsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [dropdownOpen, options.length]);

  if (loading)
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <CenteredAlert
        banner={banner}
        onClose={() => setBanner(null)}
        durationMs={5000}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-red-700 hover:bg-red-600 text-white"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-200 gap-1">
          <TabsTrigger
            value="general"
            className="rounded-md text-gray-700 hover:bg-gray-100 transition-all hover:shadow-sm data-[state=active]:!bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-lg"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="hero"
            className="rounded-lg text-gray-700 hover:bg-gray-100 transition-all hover:shadow-sm data-[state=active]:!bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-lg"
          >
            Hero
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="rounded-lg text-gray-700 hover:bg-gray-100 transition-all hover:shadow-sm data-[state=active]:!bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-lg"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="rounded-lg text-gray-700 hover:bg-gray-100 transition-all hover:shadow-sm data-[state=active]:!bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-lg"
          >
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-4 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardTitle className="flex items-center gap-2">General</CardTitle>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName || ""}
                  placeholder="Enter site name"
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Featured Pets</h2>
              <Button
                variant="outline"
                className="text-sm"
                onClick={async () => {
                  try {
                    const res = await petsAPI.getAll({ limit: 50 });
                    const items: Array<{
                      _id: string;
                      name: string;
                      breed?: string;
                    }> = (res.data.items ?? res.data) as Array<{
                      _id: string;
                      name: string;
                      breed?: string;
                    }>;
                    const current = new Set(settings?.featuredPetIds || []);
                    const toAdd = items
                      .map((p) => p._id)
                      .filter((id) => !current.has(id))
                      .slice(0, 8);
                    if (toAdd.length === 0) return;
                    setFeatured([
                      ...(settings?.featuredPetIds || []),
                      ...toAdd,
                    ]);
                    setPetLabels((prev) => {
                      const next = { ...prev } as Record<string, string>;
                      items.forEach((p) => {
                        next[p._id] = p.breed
                          ? `${p.name} (${p.breed})`
                          : p.name;
                      });
                      return next;
                    });
                    setBanner({
                      variant: "default",
                      title: "Added pets to featured (preview)",
                    });
                  } catch (err) {
                    setBanner({
                      variant: "destructive",
                      title: "Failed to query pets",
                      message: handleAPIError(err),
                    });
                  }
                }}
              >
                Quick add recent
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="bg-white text-gray-700 hover:bg-gray-100 border"
                  >
                    {selectedPetId
                      ? petLabels[selectedPetId] || selectedPetId
                      : "Choose pet"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-80 w-72 overflow-y-auto bg-white">
                  <DropdownMenuLabel>
                    {optionsLoading ? "Loading..." : "Select a pet"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(options || []).map((p) => {
                    const label = p.breed ? `${p.name} (${p.breed})` : p.name;
                    const already = (settings.featuredPetIds || []).includes(
                      p._id
                    );
                    return (
                      <DropdownMenuItem
                        key={p._id}
                        onClick={() => {
                          setSelectedPetId(p._id);
                          setPetLabels((prev) => ({ ...prev, [p._id]: label }));
                        }}
                        disabled={already}
                      >
                        {label}
                        {already && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            selected
                          </span>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="default"
                onClick={() => {
                  if (!selectedPetId) return;
                  const current = settings?.featuredPetIds || [];
                  if (current.includes(selectedPetId)) {
                    setBanner({
                      variant: "destructive",
                      title: "Already added",
                    });
                    return;
                  }
                  setFeatured([...current, selectedPetId]);
                  setBanner({
                    variant: "default",
                    title: "Added to featured (preview)",
                  });
                }}
                disabled={!selectedPetId}
                className="bg-red-700 text-white hover:bg-red-600"
              >
                Add selected
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Label htmlFor="featuredPos">Position</Label>
                <select
                  id="featuredPos"
                  aria-label="Featured section position"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={featuredPos}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...(s || {}),
                      featuredPosition: Number(e.target.value),
                    }))
                  }
                >
                  {Array.from({
                    length: (settings.sections?.length || 0) + 1,
                  }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              The featured position is reserved in the global order; section
              “Position” numbers skip this slot.
            </p>
            <p className="text-sm text-gray-500">
              Pick and order pets shown on home and other sections. The order
              below is used by the API.
            </p>
            {(settings.featuredPetIds || []).length === 0 ? (
              <p className="text-sm">No featured pets selected.</p>
            ) : (
              <ul className="space-y-2">
                {(settings.featuredPetIds || []).map((id, idx) => (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-2 border rounded p-2"
                  >
                    <div className="text-sm">
                      #{idx + 1} — {petLabels[id] || id}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (idx === 0) return;
                          const arr = [...(settings.featuredPetIds || [])];
                          const [moved] = arr.splice(idx, 1);
                          arr.splice(idx - 1, 0, moved);
                          setFeatured(arr);
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const arr = [...(settings.featuredPetIds || [])];
                          if (idx >= arr.length - 1) return;
                          const [moved] = arr.splice(idx, 1);
                          arr.splice(idx + 1, 0, moved);
                          setFeatured(arr);
                        }}
                      >
                        ↓
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-white bg-red-700 hover:bg-red-600"
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove this pet from featured?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove “{petLabels[id] || id}” from the
                              featured list. You can add it back later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="text-white bg-red-700 hover:bg-red-600"
                              onClick={() => {
                                setFeatured(
                                  (settings.featuredPetIds || []).filter(
                                    (x) => x !== id
                                  )
                                );
                                setBanner({
                                  variant: "default",
                                  title: "Removed from featured (preview)",
                                });
                              }}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 space-y-4 mt-4">
            <CardTitle className="flex items-center justify-between">
              <span>Homepage Sections</span>
              <Button
                className="bg-red-700 text-white hover:bg-red-600"
                onClick={() =>
                  setSettings((s) => ({
                    ...(s || {}),
                    sections: [
                      ...((s?.sections || []).map((x) => ({ ...x })) as any[]),
                      {
                        title: "New section",
                        contentHtml: "",
                        order: (s?.sections?.length || 0) + 1,
                        bgColor: "#ffffff",
                        textColor: "#111827",
                        fontSize: 16,
                      },
                    ],
                  }))
                }
              >
                Add section
              </Button>
            </CardTitle>
            <div className="grid gap-3">
              {(settings.sections || []).length === 0 && (
                <p className="text-sm text-gray-500">No sections yet.</p>
              )}
              {(settings.sections || [])
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((sec, idx) => (
                  <div
                    key={(sec as any)._id || idx}
                    className="rounded-md border p-3 space-y-3"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(idx));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      if (Number.isNaN(from) || from === idx) return;
                      setSettings((s) => {
                        const list = (s?.sections || []).map((x) => ({ ...x }));
                        const [moved] = list.splice(from, 1);
                        list.splice(idx, 0, moved);
                        list.forEach((x, i) => (x.order = i + 1));
                        return { ...(s || {}), sections: list } as any;
                      });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid gap-1 grow">
                        <Label>Section title</Label>
                        <Input
                          value={sec.title || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...(s || {}),
                              sections: (s?.sections || []).map((x, i) =>
                                i === idx ? { ...x, title: e.target.value } : x
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-1 w-28">
                        <Label>Collapse</Label>
                        <button
                          type="button"
                          className="border rounded-md px-2 py-1 text-sm bg-white hover:bg-gray-100"
                          onClick={() =>
                            setCollapsed((c) => ({ ...c, [idx]: !c[idx] }))
                          }
                        >
                          {collapsed[idx] ? "Expand" : "Collapse"}
                        </button>
                      </div>
                      <div className="grid gap-1 w-28">
                        <Label htmlFor={`pos-${idx}`}>Position</Label>
                        {(() => {
                          const total = (settings.sections || []).length + 1;
                          const fPos = featuredPos;
                          const order = sec.order || idx + 1;
                          const globalVal = order >= fPos ? order + 1 : order;
                          return (
                            <select
                              id={`pos-${idx}`}
                              aria-label="Global section position"
                              className="border rounded-md px-2 py-1 text-sm"
                              value={globalVal}
                              onChange={(e) => {
                                const newGlobal = Number(e.target.value);
                                if (newGlobal === fPos) return;
                                const newOrder =
                                  newGlobal > fPos ? newGlobal - 1 : newGlobal;
                                setSettings((s) => {
                                  const list = (s?.sections || []).map((x) => ({
                                    ...x,
                                  }));
                                  const [moved] = list.splice(idx, 1);
                                  list.splice(newOrder - 1, 0, moved);
                                  list.forEach((x, i) => (x.order = i + 1));
                                  return {
                                    ...(s || {}),
                                    sections: list,
                                  } as any;
                                });
                              }}
                            >
                              {Array.from({ length: total }).map((_, i) => (
                                <option
                                  key={i + 1}
                                  value={i + 1}
                                  disabled={i + 1 === fPos}
                                >
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>
                      <div className="grid gap-1 w-28 self-end">
                        <Label className="invisible">Action</Label>
                        <Button
                          variant="destructive"
                          className="text-white bg-red-700 hover:bg-red-600"
                          onClick={() =>
                            setSettings((s) => {
                              const list = (s?.sections || []).filter(
                                (_, i) => i !== idx
                              );
                              list.forEach((x, i) => (x.order = i + 1));
                              return { ...(s || {}), sections: list } as any;
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    {!collapsed[idx] && (
                      <div className="grid gap-2">
                        <Label>Content</Label>
                        <div className="rounded-md border overflow-hidden">
                          <RichTextEditor
                            key={(sec as any)._id || idx}
                            value={sec.contentHtml || ""}
                            onChange={(html) =>
                              setSettings((s) => ({
                                ...(s || {}),
                                sections: (s?.sections || []).map((x, i) =>
                                  i === idx ? { ...x, contentHtml: html } : x
                                ),
                              }))
                            }
                            placeholder="Write and format content..."
                            className="min-h-[220px]"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="grid gap-1">
                            <Label>Background</Label>
                            <Input
                              type="color"
                              value={sec.bgColor || "#ffffff"}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...(s || {}),
                                  sections: (s?.sections || []).map((x, i) =>
                                    i === idx
                                      ? { ...x, bgColor: e.target.value }
                                      : x
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label>Text color</Label>
                            <Input
                              type="color"
                              value={sec.textColor || "#111827"}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...(s || {}),
                                  sections: (s?.sections || []).map((x, i) =>
                                    i === idx
                                      ? { ...x, textColor: e.target.value }
                                      : x
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label>Font size (px)</Label>
                            <Input
                              type="number"
                              min={12}
                              max={48}
                              value={sec.fontSize || 16}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...(s || {}),
                                  sections: (s?.sections || []).map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          fontSize: Number(e.target.value),
                                        }
                                      : x
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Hero</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="heroPage">Page</Label>
                <select
                  id="heroPage"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={selectedPage}
                  aria-label="Select hero page"
                  onChange={(e) => setSelectedPage(e.target.value as PageKey)}
                >
                  <option value="home">Home</option>
                  <option value="kings">Kings</option>
                  <option value="queens">Queens</option>
                  <option value="kittens">Kittens</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="heroTitle">Title</Label>
                <Input
                  id="heroTitle"
                  value={
                    (
                      (
                        settings.hero as Partial<Record<PageKey, HeroSection>>
                      )?.[selectedPage] || {}
                    ).title || ""
                  }
                  onChange={(e) => setHero({ title: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="heroSubtitle">Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={
                    (
                      (
                        settings.hero as Partial<Record<PageKey, HeroSection>>
                      )?.[selectedPage] || {}
                    ).subtitle || ""
                  }
                  onChange={(e) => setHero({ subtitle: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="heroImage">Hero Images</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="heroImages"
                  type="file"
                  multiple
                  accept="image/*"
                  aria-label="Hero images"
                  title="Upload one or more hero images"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  onChange={(e) => {
                    const files = e.currentTarget.files;
                    if (files && files.length) addMultipleHeroImages(files);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
              {(() => {
                const imgs =
                  (
                    (settings.hero as Partial<Record<PageKey, HeroSection>>)?.[
                      selectedPage
                    ] || {}
                  ).images || [];
                if (imgs.length === 0) return null;
                return (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {imgs.map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="relative h-28 border rounded overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt={`Hero ${idx + 1}`}
                          fill
                          sizes="160px"
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-black/40 text-white text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              moveHeroImage(idx, Math.max(0, idx - 1))
                            }
                            className="px-1 hover:bg-black/60 rounded"
                          >
                            ◀
                          </button>
                          <span>{idx === 0 ? "Primary" : `#${idx + 1}`}</span>
                          <button
                            type="button"
                            onClick={() =>
                              moveHeroImage(
                                idx,
                                Math.min(imgs.length - 1, idx + 1)
                              )
                            }
                            className="px-1 hover:bg-black/60 rounded"
                          >
                            ▶
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHeroImageAt(idx)}
                          className="absolute top-1 right-1 text-xs bg-black/60 hover:bg-black/80 text-white rounded px-1"
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">About</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="aboutTitle">Title</Label>
                <Input
                  id="aboutTitle"
                  value={settings.about?.title || ""}
                  onChange={(e) => setAbout({ title: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="aboutContent">Content</Label>
              <Textarea
                id="aboutContent"
                rows={6}
                value={settings.about?.content || ""}
                onChange={(e) => setAbout({ content: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="aboutImages">Images</Label>
              <input
                id="aboutImages"
                type="file"
                accept="image/*"
                multiple
                aria-label="About images"
                title="Upload about images"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length)
                    addAboutImages(e.target.files);
                }}
              />
              {settings.about?.images && settings.about.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {settings.about.images.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 border rounded overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`About ${idx}`}
                        fill
                        sizes="128px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1"
                        onClick={() => removeAboutImage(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">Contact</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  value={settings.contact?.email || ""}
                  onChange={(e) => setContact({ email: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contact?.phone || ""}
                  onChange={(e) => setContact({ phone: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="contactAddress">Address</Label>
                <Input
                  id="contactAddress"
                  value={settings.contact?.address || ""}
                  onChange={(e) => setContact({ address: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="contactImessage">iMessage</Label>
                <Input
                  id="contactImessage"
                  value={settings.contact?.imessage || ""}
                  onChange={(e) => setContact({ imessage: e.target.value })}
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="contactMap">Map Embed (optional)</Label>
                <Textarea
                  id="contactMap"
                  rows={4}
                  placeholder="Paste a Google Maps embed iframe or leave blank to auto-generate from Address"
                  value={settings.contact?.mapEmbed || ""}
                  onChange={(e) => setContact({ mapEmbed: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  If left blank and Address is provided, a simple Google Map
                  embed will be generated on save.
                </p>
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="contactContent">Additional Content</Label>
                <Textarea
                  id="contactContent"
                  rows={4}
                  value={settings.contact?.content || ""}
                  onChange={(e) => setContact({ content: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
