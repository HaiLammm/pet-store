"use client";
import { useEffect, useState } from "react";
import PageHero from "@/components/shared/PageHero";
import PetCard from "@/components/shared/PetCard";
import Section from "@/components/shared/Section";
import EmptyState from "@/components/shared/EmptyState";
import { petsAPI, settingsAPI } from "@/lib/axios";
import type { Pet } from "@/types";

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  pedigreeURL?: string;
  petImages?: string[];
};

export default function Dashboard() {
  const [pets, setPets] = useState<BackendPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeContent, setHomeContent] = useState<string>("");
  const healthItems = [
    "Hip Dysplasia",
    "Hypertrophic Cardiomyopathy (By Ultrasound)",
    "Pyruvate Kinase Deficiency",
    "Spinal Muscular Atrophy",
    "Full DNA",
  ];

  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        setHomeContent((res.data?.homeContent as string) || "");
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    petsAPI
      .getFeatured()
      .then((res) => {
        if (!mounted) return;
        const data: BackendPet[] = (res.data.items ?? res.data) as BackendPet[];
        setPets(Array.isArray(data) ? data : []);
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <PageHero
        title="Welcome to LilyTrinh & DrogonCoon"
        subtitle="Healthy, well-socialized companions from trusted breeders."
        imageSrc="/images/placeholder.svg"
      />

      <Section className="pt-6">
        <div className="rounded-xl bg-red-700 text-white shadow-md">
          <div className="px-6 py-7 md:px-8 md:py-9">
            <h2 className="text-2xl md:text-3xl font-extrabold items-center justify-between">
              Our kings and queens
            </h2>
            <p className="mt-3 text-white/90 whitespace-pre-line">
              {homeContent ||
                "Our breeding program emphasizes thorough health testing for sire, dams & kittens. This ensures healthy parents, reduces the risk of genetic issues, and promotes lifelong well-being in our kittens."}
            </p>
            <ul className="mt-4 space-y-3">
              {healthItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-white" />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-white/90">
              Visit the Individual Cat Pages to learn more about our health
              testing.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Featured Pets">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,320px))] gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : pets.length === 0 ? (
          <EmptyState description="No featured pets available right now." />
        ) : (
          <div className="grid justify-center grid-cols-[repeat(auto-fit,minmax(260px,320px))] gap-6">
            {pets.map((pet) => {
              const mapped: Pet = {
                id: pet._id,
                name: pet.name,
                breed: pet.breed,
                age: pet.age,
                litter: pet.litter ?? [],
                gender: pet.gender,
                dob: pet.dob,
                pedigreeURL: pet.pedigreeURL,
                description: pet.description ?? "",
                petImages: pet.petImages ?? [],
                health: pet.health ?? {
                  vaccinated: false,
                  dewormed: false,
                  healthCertificate: false,
                },
                characteristics: pet.characteristics ?? {
                  size: "medium",
                  color: "",
                  weight: 0,
                  personality: [],
                },
                location: pet.location ?? "",
                createdAt:
                  (pet as unknown as { createdAt?: string }).createdAt ??
                  new Date().toISOString(),
                updatedAt:
                  (pet as unknown as { updatedAt?: string }).updatedAt ??
                  new Date().toISOString(),
              };
              return (
                <PetCard
                  key={mapped.id}
                  pet={mapped}
                  href={`/kittens/${mapped.id}`}
                />
              );
            })}
            {pets.length === 0 && (
              <p className="text-gray-500">No featured pets available.</p>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
