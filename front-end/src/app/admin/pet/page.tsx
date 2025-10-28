"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash } from "lucide-react";
import api, { petsAPI, uploadsAPI, handleAPIError } from "@/lib/axios";
import type { Pet } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CenteredAlert from "@/components/shared/CenteredAlert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  petImages?: string[];
  fatherId?: string;
  motherId?: string;
};

export default function AdminPetsPage() {
  const [items, setItems] = useState<BackendPet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendPet | null>(null);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "male" as "male" | "female",
    category: "" as "" | "Kings" | "Queens" | "Kittens",
    dob: "",
    color: "",
    litter: "",
    pedigreeURL: "",
    cattery: "",
    description: "",
    fatherId: "",
    motherId: "",
  });
  // Image groups
  const [existingPetImages, setExistingPetImages] = useState<string[]>([]);
  const [newPetImages, setNewPetImages] = useState<
    { file: File; preview: string }[]
  >([]);

  const [existingPedigreeImages, setExistingPedigreeImages] = useState<
    string[]
  >([]);
  const [newPedigreeImages, setNewPedigreeImages] = useState<
    { file: File; preview: string }[]
  >([]);

  const [existingAwardsImages, setExistingAwardsImages] = useState<string[]>(
    []
  );
  const [newAwardsImages, setNewAwardsImages] = useState<
    { file: File; preview: string }[]
  >([]);

  const [existingCertificateImages, setExistingCertificateImages] = useState<
    string[]
  >([]);
  const [newCertificateImages, setNewCertificateImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{
    variant: "default" | "destructive";
    title: string;
    message?: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchPets = useCallback(() => {
    setLoading(true);
    setError(null);
    petsAPI
      .getAll({ limit: 200, sortBy: "createdAt", sortOrder: "desc" })
      .then((res) => {
        const data = (res.data.items ?? res.data) as BackendPet[];
        setItems(data);
      })
      .catch((err) => setError(handleAPIError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const rows = useMemo(() => {
    return items.map((p) => {
      const mapped: Pet = {
        id: p._id,
        name: p.name,
        breed: p.breed,
        age: p.age,
        litter: p.litter ?? [],
        gender: p.gender,
        category: p.category,
        dob: p.dob ?? undefined,
        description: p.description ?? "",
        petImages: p.petImages ?? [],
        cattery: p.cattery || "",
        health: p.health ?? {
          vaccinated: false,
          dewormed: false,
          healthCertificate: false,
        },
        characteristics: p.characteristics ?? {
          size: "medium",
          color: "",
          weight: 0,
          personality: [],
        },
        location: p.location ?? "",
        createdAt:
          (p as unknown as { createdAt?: string }).createdAt ??
          new Date().toISOString(),
        updatedAt:
          (p as unknown as { updatedAt?: string }).updatedAt ??
          new Date().toISOString(),
      };
      const categoryDisplay =
        mapped.category ||
        (mapped.age <= 1.2
          ? "Kittens"
          : mapped.gender === "male"
          ? "Kings"
          : "Queens");
      return { mapped, categoryDisplay };
    });
  }, [items]);

  const handleDeleteConfirmed = useCallback(async (id: string) => {
    try {
      await petsAPI.delete(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
      setBanner({ variant: "default", title: "Pet deleted" });
    } catch (err) {
      const msg = handleAPIError(err);
      setBanner({
        variant: "destructive",
        title: "Failed to delete pet",
        message: msg,
      });
    } finally {
      setConfirmDeleteId(null);
    }
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      breed: "",
      age: "",
      gender: "male",
      category: "",
      dob: "",
      color: "",
      litter: "",
      pedigreeURL: "",
      cattery: "",
      description: "",
      fatherId: "",
      motherId: "",
    });
    setEditing(null);
    setExistingPetImages([]);
    setNewPetImages([]);
    setExistingPedigreeImages([]);
    setNewPedigreeImages([]);
    setExistingAwardsImages([]);
    setNewAwardsImages([]);
    setExistingCertificateImages([]);
    setNewCertificateImages([]);
  };

  // Options for Father/Mother selections
  const fatherOptions = useMemo(() => {
    return items.filter(
      (p) =>
        (p.category === "Kings" || p.gender === "male") &&
        p.category !== "Kittens"
    );
  }, [items]);
  const motherOptions = useMemo(() => {
    return items.filter(
      (p) =>
        (p.category === "Queens" || p.gender === "female") &&
        p.category !== "Kittens"
    );
  }, [items]);

  // Clear parents when not Kittens
  useEffect(() => {
    if (form.category !== "Kittens" && (form.fatherId || form.motherId)) {
      setForm((f) => ({ ...f, fatherId: "", motherId: "" }));
    }
  }, [form.category, form.fatherId, form.motherId]);

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (pet: Pet) => {
    const be = items.find((p) => p._id === pet.id) || null;
    setEditing(be);
    const toDateInput = (d?: string) => {
      if (!d) return "";
      try {
        const dt = new Date(d);
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch {
        return "";
      }
    };
    const src = be ?? (pet as unknown as BackendPet);
    const computedAge = computeAgeYears(src.dob) ?? src.age ?? 0;
    setForm({
      name: src.name,
      breed: src.breed,
      age: String(computedAge),
      gender: src.gender,
      category:
        (src.category as "Kings" | "Queens" | "Kittens" | undefined) || "",
      dob: toDateInput(src.dob),
      color: src.characteristics?.color ?? "",
      litter: (src.litter ?? []).join(", "),
      pedigreeURL: src.pedigreeURL || "",
      cattery: src.cattery || "",
      description: src.description ?? "",
      fatherId: (src as BackendPet).fatherId || "",
      motherId: (src as BackendPet).motherId || "",
    });
    setExistingPetImages(src.petImages ?? []);
    setExistingPedigreeImages(src.pedigreeImages ?? []);
    setExistingAwardsImages(src.awardsImages ?? []);
    setExistingCertificateImages(src.certificateImages ?? []);
    setNewPetImages([]);
    setNewPedigreeImages([]);
    setNewAwardsImages([]);
    setNewCertificateImages([]);
    setOpen(true);
  };

  // Generic file selector factory for each image group
  const fileSelectorFor =
    (kind: "pet" | "pedigree" | "awards" | "certificate") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      let toPreview: { file: File; preview: string }[] = [];
      try {
        toPreview = await Promise.all(
          Array.from(files).map(
            (file) =>
              new Promise<{ file: File; preview: string }>(
                (resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () =>
                    resolve({ file, preview: String(reader.result) });
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                }
              )
          )
        );
      } catch {
        setBanner({
          variant: "destructive",
          title: "Failed to read selected files",
        });
      }
      if (kind === "pet") setNewPetImages((prev) => [...prev, ...toPreview]);
      if (kind === "pedigree")
        setNewPedigreeImages((prev) => [...prev, ...toPreview]);
      if (kind === "awards")
        setNewAwardsImages((prev) => [...prev, ...toPreview]);
      if (kind === "certificate")
        setNewCertificateImages((prev) => [...prev, ...toPreview]);
      e.target.value = "";
    };

  const removeExisting = (
    kind: "pet" | "pedigree" | "awards" | "certificate",
    index: number
  ) => {
    if (kind === "pet")
      setExistingPetImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "pedigree")
      setExistingPedigreeImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "awards")
      setExistingAwardsImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "certificate")
      setExistingCertificateImages((prev) =>
        prev.filter((_, i) => i !== index)
      );
  };

  const removeNew = (
    kind: "pet" | "pedigree" | "awards" | "certificate",
    index: number
  ) => {
    if (kind === "pet")
      setNewPetImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "pedigree")
      setNewPedigreeImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "awards")
      setNewAwardsImages((prev) => prev.filter((_, i) => i !== index));
    if (kind === "certificate")
      setNewCertificateImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const ageComputed = computeAgeYears(form.dob);
    const payload = {
      name: form.name.trim(),
      breed: form.breed.trim(),
      age: ageComputed,
      gender: form.gender,
      category: (form.category || undefined) as
        | "Kings"
        | "Queens"
        | "Kittens"
        | undefined,
      dob: form.dob ? new Date(form.dob).toISOString() : undefined,
      pedigreeURL: form.pedigreeURL.trim() || undefined,
      cattery: form.cattery.trim() || undefined,
      description: form.description.trim(),
      litter: form.litter
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      characteristics: { color: form.color.trim() },
      ...(form.category === "Kittens" && form.fatherId
        ? { fatherId: form.fatherId }
        : {}),
      ...(form.category === "Kittens" && form.motherId
        ? { motherId: form.motherId }
        : {}),
    };
    if (!payload.name || !payload.breed || !payload.gender) {
      setError("Please fill in name, breed and gender.");
      return;
    }
    try {
      setError(null);
      setSubmitting(true);
      // Upload each image group
      const uploadGroup = async (
        list: { preview: string }[]
      ): Promise<string[]> => {
        if (list.length === 0) return [];
        const results = await Promise.all(
          list.map((img) => uploadsAPI.uploadBase64(img.preview))
        );
        const urls: string[] = [];
        results.forEach((r) => {
          const url = (r.data?.url as string) || "";
          if (url) urls.push(url);
        });
        return urls;
      };

      let uploadedPet: string[] = [];
      let uploadedPedigree: string[] = [];
      let uploadedAwards: string[] = [];
      let uploadedCertificate: string[] = [];
      try {
        [uploadedPet, uploadedPedigree, uploadedAwards, uploadedCertificate] =
          await Promise.all([
            uploadGroup(newPetImages),
            uploadGroup(newPedigreeImages),
            uploadGroup(newAwardsImages),
            uploadGroup(newCertificateImages),
          ]);
      } catch (err) {
        const msg = handleAPIError(err);
        setBanner({
          variant: "destructive",
          title: "Image upload failed",
          message: msg,
        });
        throw err;
      }

      const petImages = [...existingPetImages, ...uploadedPet];
      const pedigreeImages = [...existingPedigreeImages, ...uploadedPedigree];
      const awardsImages = [...existingAwardsImages, ...uploadedAwards];
      const certificateImages = [
        ...existingCertificateImages,
        ...uploadedCertificate,
      ];
      const body = {
        ...payload,
        petImages,
        pedigreeImages,
        awardsImages,
        certificateImages,
      } as typeof payload & {
        petImages: string[];
        pedigreeImages: string[];
        awardsImages: string[];
        certificateImages: string[];
      };
      if (editing?._id) {
        await api.put(`/pets/${editing._id}`, body);
        setBanner({ variant: "default", title: "Pet updated" });
      } else {
        await api.post(`/pets`, body);
        setBanner({ variant: "default", title: "Pet created" });
      }
      setOpen(false);
      resetForm();
      // Reload page to ensure all lists/UI reflect latest state
      if (typeof window !== "undefined") window.location.reload();
    } catch (err) {
      const msg = handleAPIError(err);
      setError(msg);
      if (!msg?.toLowerCase().includes("upload")) {
        setBanner({
          variant: "destructive",
          title: "Action failed",
          message: msg,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  function computeAgeYears(dobInput?: string) {
    if (!dobInput) return 0;
    try {
      const dob = new Date(dobInput);
      if (isNaN(dob.getTime())) return 0;
      const now = new Date();
      const diffMs = now.getTime() - dob.getTime();
      const yearMs = 365.2425 * 24 * 60 * 60 * 1000; // average year length
      const years = diffMs / yearMs;
      return Number(years.toFixed(2));
    } catch {
      return 0;
    }
  }

  return (
    <div className="space-y-6">
      <CenteredAlert
        banner={banner}
        onClose={() => setBanner(null)}
        durationMs={5000}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pets</h1>
        <Button
          className="bg-red-700 hover:bg-red-600 text-white"
          onClick={openAdd}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Pet
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cattery</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map(({ mapped, categoryDisplay }) => (
                <TableRow key={mapped.id}>
                  <TableCell className="font-medium">{mapped.name}</TableCell>
                  <TableCell className="capitalize">{mapped.gender}</TableCell>
                  <TableCell className="capitalize">
                    {categoryDisplay}
                  </TableCell>
                  <TableCell className="capitalize">{mapped.cattery}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(mapped)}
                        className="text-white hover:bg-blue-600 border-blue-700 bg-blue-700 border hover:border-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeleteId(mapped.id)}
                        className="text-white hover:bg-red-600 border-red-700 bg-red-700 border hover:border-red-600"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent
          hideOverlay
          className="bg-card text-foreground border border-border"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              pet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 border border-black"
              onClick={() =>
                confirmDeleteId && handleDeleteConfirmed(confirmDeleteId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm();
          setOpen(v);
        }}
      >
        <DialogContent
          className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-card text-foreground border border-border shadow-xl max-h-[90dvh] overflow-y-auto"
          hideOverlay
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Pet" : "Add Pet"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor="petImages">Pet Images</Label>
              <input
                id="petImages"
                type="file"
                accept="image/*"
                multiple
                onChange={fileSelectorFor("pet")}
                aria-label="Pet images"
                title="Select pet images"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-600"
              />
              {(existingPetImages.length > 0 || newPetImages.length > 0) && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingPetImages.map((url, idx) => (
                    <div
                      key={`ex-pet-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={url}
                        alt="pet image"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting("pet", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newPetImages.map((img, idx) => (
                    <div
                      key={`new-pet-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={img.preview}
                        alt="new image preview"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew("pet", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedigree Images */}
            <div className="grid gap-1">
              <Label htmlFor="pedigreeImages">Pedigree Images</Label>
              <input
                id="pedigreeImages"
                type="file"
                accept="image/*"
                multiple
                onChange={fileSelectorFor("pedigree")}
                aria-label="Pedigree images"
                title="Select pedigree images"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-600"
              />
              {(existingPedigreeImages.length > 0 ||
                newPedigreeImages.length > 0) && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingPedigreeImages.map((url, idx) => (
                    <div
                      key={`ex-ped-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={url}
                        alt="pedigree image"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting("pedigree", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newPedigreeImages.map((img, idx) => (
                    <div
                      key={`new-ped-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={img.preview}
                        alt="new image preview"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew("pedigree", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Awards Images */}
            <div className="grid gap-1">
              <Label htmlFor="awardsImages">Awards Images</Label>
              <input
                id="awardsImages"
                type="file"
                accept="image/*"
                multiple
                onChange={fileSelectorFor("awards")}
                aria-label="Awards images"
                title="Select awards images"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-600"
              />
              {(existingAwardsImages.length > 0 ||
                newAwardsImages.length > 0) && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingAwardsImages.map((url, idx) => (
                    <div
                      key={`ex-aw-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={url}
                        alt="awards image"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting("awards", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newAwardsImages.map((img, idx) => (
                    <div
                      key={`new-aw-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={img.preview}
                        alt="new image preview"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew("awards", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate Images */}
            <div className="grid gap-1">
              <Label htmlFor="certificateImages">Certificate Images</Label>
              <input
                id="certificateImages"
                type="file"
                accept="image/*"
                multiple
                onChange={fileSelectorFor("certificate")}
                aria-label="Certificate images"
                title="Select certificate images"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-600"
              />
              {(existingCertificateImages.length > 0 ||
                newCertificateImages.length > 0) && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingCertificateImages.map((url, idx) => (
                    <div
                      key={`ex-cert-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={url}
                        alt="certificate image"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting("certificate", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newCertificateImages.map((img, idx) => (
                    <div
                      key={`new-cert-${idx}`}
                      className="relative group rounded-md overflow-hidden border h-24"
                    >
                      <Image
                        src={img.preview}
                        alt="new image preview"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew("certificate", idx)}
                        className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 gap-x-4 md:col-span-2">
              <div className="grid gap-1">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={form.breed}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, breed: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  step="0.1"
                  min="0"
                  value={computeAgeYears(form.dob).toString()}
                  disabled
                />
              </div>
            </div>
            <div className="grid gap-1 grid-cols-1 sm:grid-cols-3 gap-x-4">
              <div className="grid gap-1">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  aria-label="Gender"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.gender}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      gender: e.target.value as "male" | "female",
                    }))
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {form.category === "Kittens" && (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:col-span-2 [&_*]:min-w-0">
                <div className="grid gap-1">
                  <Label>Father</Label>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between overflow-hidden"
                        >
                          <span className="truncate">
                            {form.fatherId
                              ? fatherOptions.find(
                                  (p) => p._id === form.fatherId
                                )?.name || form.fatherId
                              : "Choose father"}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card text-foreground border border-border max-h-80 overflow-auto w-64">
                        <DropdownMenuLabel>Select a father</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {fatherOptions.map((p) => (
                          <DropdownMenuItem
                            key={p._id}
                            onClick={() =>
                              setForm((f) => ({ ...f, fatherId: p._id }))
                            }
                          >
                            {p.name} {p.breed ? `(${p.breed})` : ""}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {form.fatherId && (
                      <Button
                        variant="ghost"
                        onClick={() => setForm((f) => ({ ...f, fatherId: "" }))}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label>Mother</Label>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between overflow-hidden"
                        >
                          <span className="truncate">
                            {form.motherId
                              ? motherOptions.find(
                                  (p) => p._id === form.motherId
                                )?.name || form.motherId
                              : "Choose mother"}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card text-foreground border border-border max-h-80 overflow-auto w-64">
                        <DropdownMenuLabel>Select a mother</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {motherOptions.map((p) => (
                          <DropdownMenuItem
                            key={p._id}
                            onClick={() =>
                              setForm((f) => ({ ...f, motherId: p._id }))
                            }
                          >
                            {p.name} {p.breed ? `(${p.breed})` : ""}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {form.motherId && (
                      <Button
                        variant="ghost"
                        onClick={() => setForm((f) => ({ ...f, motherId: "" }))}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-1">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                aria-label="Category"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as
                      | "Kings"
                      | "Queens"
                      | "Kittens"
                      | "",
                  }))
                }
              >
                <option value="">Auto</option>
                <option value="Kings">Kings</option>
                <option value="Queens">Queens</option>
                <option value="Kittens">Kittens</option>
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="cattery">Cattery</Label>
              <Input
                id="cattery"
                value={form.cattery}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cattery: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="dob">DoB</Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => {
                  const dob = e.target.value;
                  const age = computeAgeYears(dob);
                  setForm((f) => ({ ...f, dob, age: age.toString() }));
                }}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="litter">Litter</Label>
              <Input
                id="litter"
                placeholder="e.g., Kit A, Kit B"
                value={form.litter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, litter: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list.
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="pedigreeURL">Pedigree URL</Label>
              <Input
                id="pedigreeURL"
                placeholder="https://..."
                value={form.pedigreeURL}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pedigreeURL: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-700 hover:bg-red-600 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
