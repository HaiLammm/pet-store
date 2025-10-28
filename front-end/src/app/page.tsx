"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import PageHero from "@/components/shared/PageHero";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Section from "@/components/shared/Section";
import PetCard from "@/components/shared/PetCard";
import EmptyState from "@/components/shared/EmptyState";
import { settingsAPI, petsAPI } from "@/lib/axios";
import type { Pet } from "@/types";
import Image from "next/image";

type HomeSection = {
  _id?: string;
  title?: string;
  contentHtml?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  order?: number;
};

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  pedigreeURL?: string;
  petImages?: string[];
};

export default function HomePage() {
  const [hero, setHero] = useState<{
    title?: string;
    subtitle?: string;
    image?: string;
    images?: string[];
  }>({});
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [pets, setPets] = useState<BackendPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [featuredPos, setFeaturedPos] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const arr = (res.data?.sections as HomeSection[]) || [];
        setSections([...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        const count = arr.length;
        const pos = Number(res.data?.featuredPosition) || count + 1;
        setFeaturedPos(Math.min(Math.max(1, pos), count + 1));
        const h =
          (res.data?.hero?.home as {
            title?: string;
            subtitle?: string;
            image?: string;
            images?: string[];
          }) || {};
        setHero(h || {});
      })
      .catch(() => setSections([]));
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
      .finally(() => setLoadingPets(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {Array.isArray(hero.images) && hero.images.length > 1 ? (
        <section className="relative bg-gray-200">
          <div className="container mx-auto px-0">
            <Carousel className="w-full">
              <CarouselContent>
                {hero.images.map((src, i) => (
                  <CarouselItem key={src || i}>
                    <PageHero
                      title={hero.title || "Welcome to our Cattery"}
                      subtitle={
                        hero.subtitle || "Healthy, socialized cats and kittens."
                      }
                      imageSrc={src || "/images/placeholder.svg"}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      ) : (
        <PageHero
          title={hero.title || "Welcome to our Cattery"}
          subtitle={hero.subtitle || "Healthy, socialized cats and kittens."}
          imageSrc={
            (hero.images && hero.images[0]) || "/images/placeholder.svg"
          }
        />
      )}
      {/* Admin-managed homepage sections with Featured inserted at selected position */}
      {sections.map((sec, idx) => {
        const themeClass = `themed-${sec._id || idx}`;
        // Normalize admin-provided colors so white becomes theme-aware in dark mode
        const norm = (sec.bgColor || "").trim().toLowerCase();
        const isWhite =
          norm === "#fff" ||
          norm === "#ffffff" ||
          norm === "white" ||
          norm === "rgb(255,255,255)" ||
          norm === "rgba(255,255,255,1)";
        const bg = isWhite ? "var(--color-card)" : sec.bgColor || "transparent";
        const color = sec.textColor || "inherit";
        const titleSize = sec.fontSize ? `${sec.fontSize}px` : undefined;
        const key = sec._id || `${sec.title}-${sec.order}`;
        return (
          <Fragment key={key}>
            {featuredPos === idx + 1 && (
              <FeaturedBlock pets={pets} loading={loadingPets} />
            )}
            <Section className="pt-6">
              <style jsx>{`
                .${themeClass} {
                  background-color: ${bg};
                  color: ${color};
                }
                /* In dark mode, remove inline white/highlight backgrounds pasted from editors */
                :global(.dark) .${themeClass} [style*="background"] {
                  background: transparent !important;
                }
                :global(.dark) .${themeClass} [style*="background-color"] {
                  background-color: transparent !important;
                }
                :global(.dark) .${themeClass} [class*="ql-bg-"] {
                  background-color: transparent !important;
                }
                :global(.dark) .${themeClass} mark {
                  background: transparent !important;
                }
                .${themeClass} ul {
                  list-style: disc !important;
                  list-style-position: outside;
                  padding-left: 1.25rem;
                  margin: 0.5rem 0;
                }
                .${themeClass} ol {
                  list-style: decimal !important;
                  list-style-position: outside;
                  padding-left: 1.25rem;
                  margin: 0.5rem 0;
                }
                .${themeClass} li {
                  margin: 0.25rem 0;
                  display: list-item;
                  padding-left: 0.125rem;
                }
                .${themeClass} li::marker {
                  color: currentColor;
                }
                .${themeClass} [data-list="bullet"],
                .${themeClass} [data-list="ordered"] {
                  display: list-item;
                  margin-left: 1.25rem;
                  margin-top: 0.25rem;
                  margin-bottom: 0.25rem;
                }
                .${themeClass} [data-list="bullet"]::marker {
                  content: "\\u2022 ";
                }
                .${themeClass} [data-list="ordered"]::marker {
                  content: counter(list-item) ". ";
                }
                .${themeClass} [data-list="bullet"]:not(li) {
                  display: block;
                  position: relative;
                  padding-left: 1.25rem;
                }
                .${themeClass} [data-list="bullet"]:not(li)::before {
                  content: "\\u2022";
                  position: absolute;
                  left: 0;
                  color: currentColor;
                }
                .${themeClass}-title {
                  ${titleSize ? `font-size: ${titleSize};` : ""}
                }
              `}</style>
              <div
                className={`rounded-md border border-border px-6 py-7 md:px-8 md:py-9 ${themeClass}`}
              >
                {sec.title && (
                  <>
                    <h2
                      className={`font-extrabold text-center ${themeClass}-title`}
                    >
                      {sec.title}
                    </h2>
                    <div className="h-1 w-52 rounded-full mx-auto mb-6 bg-[currentColor]" />
                  </>
                )}
                <HtmlContent
                  className="prose max-w-none [&_*]:!text-inherit [&_*]:!leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
                  html={sec.contentHtml || ""}
                />
              </div>
            </Section>
          </Fragment>
        );
      })}
      {/* If Featured position is after all sections */}
      {sections.length + 1 === featuredPos && (
        <FeaturedBlock pets={pets} loading={loadingPets} />
      )}

      {/* Cat registries section */}
      <Section>
        <div className="rounded-md border border-border px-6 py-7 md:px-8 md:py-9">
          <h2 className="text-center font-extrabold text-red-700 text-3xl">
            Cat registries We Work With
          </h2>
          <div className="h-1 w-52 rounded-full mx-auto mt-2 mb-6 bg-red-700" />
          <p className="text-muted-foreground text-xl text-center md:text-center">
            We register our cat & kittens with reputable associations.
          </p>
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/images/logo/World_Cat_Federation_logo.png"
                alt="WCF logo"
                width={48}
                height={48}
                className="shrink-0"
                unoptimized
              />
              <span className="text-xl text-foreground">
                World Cat Federation
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/images/logo/Cat_Fanciers'_Association_new_logo.png"
                alt="CFA logo"
                width={48}
                height={48}
                className="shrink-0"
                unoptimized
              />
              <span className="text-xl text-foreground">
                Cat Fanciers Federation
              </span>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function FeaturedBlock({
  pets,
  loading,
}: {
  pets: BackendPet[];
  loading: boolean;
}) {
  return (
    <Section>
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-extrabold text-red-700 text-3xl">
            Our kings and queens
          </h2>
          <div className="h-1 w-52 rounded-full mx-auto mt-2 mb-6 bg-red-700" />
          <div className="grid justify-center grid-cols-[repeat(auto-fit,minmax(260px,320px))] gap-6">
            {pets.map((pet) => {
              const mapped: Pet = {
                id: pet._id,
                name: pet.name,
                breed: pet.breed,
                age: pet.age,
                litter: pet.litter ?? [],
                category: pet.category ?? undefined,
                gender: pet.gender,
                dob: pet.dob ?? undefined,
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
              const segRaw = (pet.category || "").toString().toLowerCase();
              const segment =
                segRaw === "kings"
                  ? "kings"
                  : segRaw === "queens"
                  ? "queens"
                  : "kittens";
              return (
                <PetCard
                  key={mapped.id}
                  pet={mapped}
                  href={`/${segment}/${mapped.id}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

// Convert pseudo-bullets (•, -, *) into real lists while preserving inline markup
function HtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Helper to strip inline backgrounds that are white-ish
    const sanitizeBackgrounds = (node: ParentNode) => {
      const isDark = document.documentElement.classList.contains("dark");
      if (!isDark) return;
      const whiteVals = new Set([
        "#fff",
        "#ffffff",
        "white",
        "rgb(255,255,255)",
        "rgba(255,255,255,1)",
      ]);
      // Any element with style containing background or background-color
      Array.from(node.querySelectorAll<HTMLElement>("[style]"))
        .filter((el) => /background/i.test(el.getAttribute("style") || ""))
        .forEach((el) => {
          const bg = (el.style.background || "").replace(/\s+/g, "");
          const bgc = (el.style.backgroundColor || "").replace(/\s+/g, "");
          if (!bg && !bgc) {
            // Still enforce transparency when any background is present in style attribute
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
            return;
          }
          if (
            whiteVals.has(bgc.toLowerCase()) ||
            whiteVals.has(bg.toLowerCase())
          ) {
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          } else {
            // Force transparent in dark if any background defined
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          }
        });
      // Quill background classes and mark
      Array.from(
        node.querySelectorAll<HTMLElement>('[class*="ql-bg-"], mark')
      ).forEach((el) => {
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("background-color", "transparent", "important");
      });
    };
    // 1) Convert Quill-style paragraphs with data-list attr into real lists
    const toProcess = Array.from(
      root.querySelectorAll<HTMLElement>("p[data-list], div[data-list]")
    ).filter((el) => !el.closest("ul,ol,li"));
    toProcess.forEach((start) => {
      if (!start.isConnected) return;
      const type = start.getAttribute("data-list");
      if (type !== "bullet" && type !== "ordered") return;
      const list = document.createElement(type === "bullet" ? "ul" : "ol");
      list.style.margin = "0.5rem 0";
      list.style.paddingLeft = "1.25rem";
      start.parentElement?.insertBefore(list, start);
      let curr: Element | null = start;
      while (
        curr &&
        curr.getAttribute &&
        curr.getAttribute("data-list") === type
      ) {
        const li = document.createElement("li");
        li.innerHTML = curr.innerHTML;
        // preserve useful classes like alignment/indent
        if (curr instanceof HTMLElement && curr.className)
          li.className = curr.className;
        list.appendChild(li);
        const nextEl: Element | null = curr.nextElementSibling;
        curr.remove();
        curr = nextEl;
      }
    });

    const bulletTextRe =
      /^[\s\u00A0\u202F]*(?:[•\u2022\u25CF\u00B7\-*])(\s|\u00A0|\u202F)+/;
    const bulletHtmlRe =
      /^(?:\s|\u00A0|\u202F|&nbsp;|<[^>]+>)*(?:[•\u2022\u25CF\u00B7\-*]|&bull;|&#8226;)(?:\s|\u00A0|\u202F|&nbsp;)+/i;
    const stripLeading = (h: string) => h.replace(bulletHtmlRe, "");

    const getParas = () =>
      Array.from(root.querySelectorAll<HTMLParagraphElement>("p"));
    let paras = getParas();
    let i = 0;
    while (i < paras.length) {
      const p = paras[i];
      if (!p.isConnected || p.closest("ul,ol,li")) {
        i++;
        continue;
      }
      const h = p.innerHTML;
      const t = p.textContent || "";
      const looksBullet = bulletTextRe.test(t) || bulletHtmlRe.test(h);
      if (looksBullet) {
        const ul = document.createElement("ul");
        ul.style.margin = "0.5rem 0";
        ul.style.paddingLeft = "1.25rem";
        ul.style.listStyle = "disc";
        p.parentElement?.insertBefore(ul, p);
        let j = i;
        while (j < paras.length) {
          const pj = paras[j];
          if (!pj.isConnected || pj.closest("ul,ol,li")) break;
          const hh = pj.innerHTML;
          const tt = pj.textContent || "";
          if (!(bulletTextRe.test(tt) || bulletHtmlRe.test(hh))) break;
          const li = document.createElement("li");
          li.innerHTML = stripLeading(hh);
          ul.appendChild(li);
          pj.remove();
          j++;
        }
        i = j;
        paras = getParas();
        continue;
      }
      // Single paragraph with <br>-separated bullet-looking lines
      if (h.toLowerCase().includes("<br")) {
        const pieces = h.split(/<br\s*\/?>(?![^<]*>)/i);
        const bullets: string[] = [];
        for (const piece of pieces) {
          const plain = piece.replace(/<[^>]+>/g, "");
          if (bulletTextRe.test(plain) || bulletHtmlRe.test(piece)) {
            bullets.push(stripLeading(piece));
          }
        }
        if (bullets.length >= 2) {
          const ul = document.createElement("ul");
          ul.style.margin = "0.5rem 0";
          ul.style.paddingLeft = "1.25rem";
          ul.style.listStyle = "disc";
          bullets.forEach((b) => {
            const li = document.createElement("li");
            li.innerHTML = b;
            ul.appendChild(li);
          });
          p.replaceWith(ul);
          paras = getParas();
          i = 0;
          continue;
        }
      }
      i++;
    }

    // Initial sanitize and observe future changes
    sanitizeBackgrounds(root);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "childList") {
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1) sanitizeBackgrounds(n as ParentNode);
          });
        } else if (r.type === "attributes" && r.target) {
          sanitizeBackgrounds(r.target.parentNode || root);
        }
      }
    });
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => mo.disconnect();
  }, [html]);
  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
