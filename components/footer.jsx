import Image from "next/image";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="mx-auto py-2 px-4 flex justify-between items-center shadow-md border-t-2">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src="/logo.png"
            width="150"
            height="60"
            alt="Scheduler Logo"
            className="h-16 w-auto"
          />
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Scheduler. All rights reserved.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/privacy" className="text-sm hover:underline text-muted-foreground">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-sm hover:underline text-muted-foreground">
          Terms of Service
        </Link>
        <Link href="/contact" className="text-sm hover:underline text-muted-foreground">
          Contact
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
