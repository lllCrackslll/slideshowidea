import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
  const textSize = size === "sm" ? "text-sm" : "text-base sm:text-lg";

  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-baseline font-semibold tracking-tight ${textSize} ${className}`}
    >
      <span className="text-[#1d1d1f] transition-colors group-hover:text-black">
        carrousels
      </span>
      <span className="text-[#007aff] transition-colors group-hover:text-[#0066d6]">
        .studio
      </span>
    </Link>
  );
}
