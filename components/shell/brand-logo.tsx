import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-center gap-0.5 text-base font-bold tracking-tight sm:text-lg ${className}`}
    >
      <span className="k-text">carrousels</span>
      <span className="k-accent">.studio</span>
    </Link>
  );
}
