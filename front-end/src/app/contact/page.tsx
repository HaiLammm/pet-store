"use client";
import { useEffect, useMemo, useState } from "react";
import { settingsAPI } from "@/lib/axios";
import Section from "@/components/shared/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Copy, Check, MessageSquare } from "lucide-react";

type Contact = {
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  imessage?: string;
  mapEmbed?: string;
  content?: string;
};

export default function ContactPage() {
  const [contact, setContact] = useState<Contact>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ key: string | null; at: number }>({
    key: null,
    at: 0,
  });
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const data = res.data as { contact?: Contact };
        setContact(data.contact || {});
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load contact info");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const mapsHref = useMemo(
    () =>
      contact.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            contact.address
          )}`
        : null,
    [contact.address]
  );
  // derive an embed when only address is provided
  const mapEmbedHtml = useMemo(() => {
    if (contact.mapEmbed && contact.mapEmbed.trim()) return contact.mapEmbed;
    if (contact.address && contact.address.trim()) {
      const q = encodeURIComponent(contact.address);
      return `<iframe src="https://www.google.com/maps?q=${q}&output=embed" width="100%" height="100%" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }
    return "";
  }, [contact.mapEmbed, contact.address]);

  const handleCopy = async (key: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied({ key, at: Date.now() });
      setTimeout(
        () => setCopied((c) => (c.key === key ? { key: null, at: 0 } : c)),
        1500
      );
    } catch {}
  };

  return (
    <Section title="Contact">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* left column: details and actions */}
        <div className="space-y-6">
          <Card className="p-4 md:p-5 space-y-3 md:space-y-4 bg-gradient-to-br from-red-50/40 to-transparent">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : contact.content ? (
              <p className="text-muted-foreground whitespace-pre-line text-base md:text-xl font-semibold md:font-bold">
                {contact.content}
              </p>
            ) : (
              <p className="text-muted-foreground">
                We&apos;d love to hear from you.
              </p>
            )}

            <div className="space-y-3">
              {/* email */}
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : contact.email ? (
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-8 w-8 rounded-md bg-red-50 text-red-700 grid place-items-center border border-red-100">
                      <Mail className="h-4 w-4" />
                    </span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="break-words sm:truncate hover:text-red-700"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-700"
                    onClick={() => handleCopy("email", contact.email)}
                    aria-label="Copy email"
                  >
                    {copied.key === "email" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : null}

              {/* phone */}
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : contact.phone ? (
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-8 w-8 rounded-md bg-red-50 text-red-700 grid place-items-center border border-red-100">
                      <Phone className="h-4 w-4" />
                    </span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="break-words sm:truncate hover:text-red-700"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-700"
                    onClick={() => handleCopy("phone", contact.phone)}
                    aria-label="Copy phone"
                  >
                    {copied.key === "phone" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : null}

              {/* address */}
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : contact.address ? (
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="h-8 w-8 rounded-md bg-red-50 text-red-700 grid place-items-center border border-red-100">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <p
                      className="text-sm leading-6 break-words"
                      title={contact.address}
                    >
                      {contact.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {mapsHref && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-red-700 text-white hover:bg-red-600"
                      >
                        <a href={mapsHref} target="_blank" rel="noreferrer">
                          <span className="hidden sm:inline">
                            Open in Google Maps
                          </span>
                          <span className="sm:hidden inline">Open Maps</span>
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-red-700"
                      onClick={() => handleCopy("address", contact.address)}
                      aria-label="Copy address"
                    >
                      {copied.key === "address" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* iMessage */}
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : contact.imessage ? (
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-8 w-8 rounded-md bg-red-50 text-red-700 grid place-items-center border border-red-100">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <a
                      href={`imessage:${encodeURIComponent(contact.imessage)}`}
                      className="break-words sm:truncate hover:text-red-700"
                      title={contact.imessage}
                    >
                      iMessage: {contact.imessage}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-700"
                    onClick={() => handleCopy("imessage", contact.imessage)}
                    aria-label="Copy iMessage"
                  >
                    {copied.key === "imessage" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : null}
            </div>

            {error && !loading && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </Card>
        </div>

        {/* right column: map */}
        <div>
          <Card className="p-2 md:p-3 ring-1 ring-red-100 bg-gradient-to-b from-red-50/30 to-transparent">
            {loading ? (
              <Skeleton className="aspect-video w-full rounded" />
            ) : mapEmbedHtml ? (
              <div className="aspect-video w-full rounded-md overflow-hidden border border-red-200 shadow-sm bg-white">
                <div
                  className="h-full w-full"
                  dangerouslySetInnerHTML={{ __html: mapEmbedHtml }}
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-md border grid place-items-center text-muted-foreground">
                Map not available
              </div>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
}
