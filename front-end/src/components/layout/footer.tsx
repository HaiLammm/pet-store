"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, PawPrint } from "lucide-react";

export default function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="bg-red-700">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-white" />
              <span className="font-bold text-xl text-white">
                LilyTrinh & DrogonCoon Cattery
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-white">
              Maine Coon Cattery
            </p>
            <div className="flex mt-6 space-x-4">
              <Link href="#" className="text-muted-foreground text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Pet</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/kings"
                  className="text-sm text-muted-foreground text-white"
                >
                  Kings
                </Link>
              </li>
              <li>
                <Link
                  href="/queens"
                  className="text-sm text-muted-foreground text-white"
                >
                  Queens
                </Link>
              </li>
              <li>
                <Link
                  href="/kittens"
                  className="text-sm text-muted-foreground text-white"
                >
                  Kittens
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Organization</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Service</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/policy"
                  className="text-sm text-muted-foreground text-white"
                >
                  Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-muted-foreground border-white">
          <p className="text-xs text-muted-foreground text-white">
            &copy; {year ?? "—"} LilyTrinh & DrogonCoon Cattery. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
