import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group -ml-6 inline-flex shrink-0 items-center gap-0.5 text-xl font-bold tracking-tight sm:-ml-12 sm:text-2xl ${className}`}
    >
      <span className="k-text">carrousels</span>
      <span className="k-accent">.studio</span>
    </Link>
  );
}
