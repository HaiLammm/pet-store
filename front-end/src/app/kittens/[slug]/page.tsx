export const runtime = "edge"; // Required by Cloudflare Pages for this dynamic route
import Image from "next/image";
import ZoomableImage from "@/components/shared/ZoomableImage";
import { notFound } from "next/navigation";
import type { Pet } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { API_BASE_URL } from "@/constants";

async function getPet(id: string): Promise<Pet> {
  // id is used in the fetch call; rename to avoid lint false positive if configured
  const res = await fetch(`${API_BASE_URL}/pets/${id}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to fetch pet");
  const data = await res.json();
  // Normalize to Pet shape
  return {
    id: data._id || data.id,
    name: data.name,
    breed: data.breed,
    age: data.age,
    litter: data.litter ?? [],
    gender: data.gender,
    dob: data.dob,
    pedigreeURL: data.pedigreeURL,
    description: (data.description ?? "").trim(),
    petImages: data.petImages ?? data.images ?? [],
    pedigreeImages: data.pedigreeImages ?? [],
    awardsImages: data.awardsImages ?? [],
    certificateImages: data.certificateImages ?? [],
    cattery: data.cattery,
    health: data.health ?? {
      vaccinated: false,
      dewormed: false,
      healthCertificate: false,
    },
    characteristics: data.characteristics ?? {
      size: "medium",
      color: "",
      weight: 0,
      personality: [],
    },
    location: data.location ?? "",
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  } as Pet;
}

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pet = await getPet(slug);
  const images: string[] = pet.petImages?.length
    ? pet.petImages
    : ["/images/placeholder.svg"]; // fallback
  const pedigreeCount = pet.pedigreeImages?.length ?? 0;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-4">
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((src, idx) => (
                  <CarouselItem key={idx}>
                    <ZoomableImage
                      src={src}
                      alt={`${pet.name} image ${idx + 1}`}
                    >
                      <div className="relative w-full aspect-square overflow-hidden rounded-md">
                        <Image
                          src={src}
                          alt={`${pet.name} image ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized={src.startsWith("http")}
                        />
                      </div>
                    </ZoomableImage>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>
          </div>
        </Card>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            {pet.litter?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {pet.litter.map((l, i) => (
                  <Badge key={i} variant="outline" className="capitalize">
                    {l}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Card className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Breed:</span>{" "}
                {pet.breed}
              </div>
              {pet.cattery && (
                <div>
                  <span className="text-muted-foreground">Cattery:</span>{" "}
                  {pet.cattery}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Gender:</span>{" "}
                {pet.gender}
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span> {pet.age}{" "}
                years
              </div>
              {pet.dob && (
                <div>
                  <span className="text-muted-foreground">DoB:</span>{" "}
                  {new Date(pet.dob).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Color:</span>{" "}
                {pet.characteristics?.color || "—"}
              </div>
              {pet.pedigreeURL && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Pedigree:</span>{" "}
                  <a
                    href={pet.pedigreeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {pet.pedigreeURL}
                  </a>
                </div>
              )}
            </div>
          </Card>
          {pet.description && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {pet.description}
              </p>
            </Card>
          )}
        </div>
      </div>
      {pet.pedigreeImages && pet.pedigreeImages.length > 0 && (
        <Card className="p-4 mt-8 border border-gray-100">
          <h2 className="font-semibold text-xl mb-4 text-center">PEDIGREE</h2>
          {pedigreeCount === 1 ? (
            <div className="flex justify-center">
              {pet.pedigreeImages.map((src, idx) => (
                <div key={`pedigree-wrap-${idx}`} className="w-fit">
                  <ZoomableImage src={src} alt={`Pedigree ${idx + 1}`}>
                    <figure className="flex flex-col items-center w-fit">
                      <div className="relative inline-flex items-center justify-center overflow-hidden bg-white p-2">
                        <Image
                          src={src}
                          alt={`Pedigree ${idx + 1}`}
                          width={1600}
                          height={1200}
                          className="object-contain w-auto h-auto max-h-[70vh]"
                          unoptimized={src.startsWith("http")}
                        />
                      </div>
                    </figure>
                  </ZoomableImage>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
              {pet.pedigreeImages.map((src, idx) => (
                <div key={`pedigree-wrap-${idx}`} className="w-fit mx-auto">
                  <ZoomableImage src={src} alt={`Pedigree ${idx + 1}`}>
                    <figure className="flex flex-col items-center w-fit">
                      <div className="relative inline-flex items-center justify-center overflow-hidden bg-white p-2 rounded-md border border-gray-300">
                        <Image
                          src={src}
                          alt={`Pedigree ${idx + 1}`}
                          width={1600}
                          height={1200}
                          className="object-contain w-auto h-auto max-h-[70vh]"
                          unoptimized={src.startsWith("http")}
                        />
                      </div>
                    </figure>
                  </ZoomableImage>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
