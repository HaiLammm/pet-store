"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Pet } from "@/types/pet";

type PetCardProps = {
  pet: Pet;
  href: string;
};

export default function PetCard({ pet, href }: PetCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    (pet.petImages && pet.petImages[0]) || "/images/placeholder.svg"
  );

  return (
    <div className="relative bg-card text-foreground border border-border rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col w-full max-w-[320px] group">
      <div className="relative w-full aspect-[4/3] bg-muted">
        <Link
          href={href}
          aria-label={`Open ${pet.name} details`}
          className="block w-full h-full"
        >
          <Image
            src={imgSrc}
            alt={`${pet.name} - ${pet.breed}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out hover:scale-105"
            onError={() => setImgSrc("/images/placeholder.svg")}
          />
        </Link>
      </div>
      <div className="p-4">
        {pet.litter?.length > 0 && (
          <div
            className={`text-xs border px-2 py-0.5 rounded-full mb-2 inline-block`}
          >
            Litter: {pet.litter.join(", ")}
          </div>
        )}
        <h3 className="text-lg font-semibold">{pet.name}</h3>
        <p className="text-sm text-muted-foreground">{pet.breed}</p>
        <Link
          href={href}
          aria-label={`View details of ${pet.name}`}
          className="mt-3 inline-flex items-center justify-center text-sm text-white bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
