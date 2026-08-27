interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 26, text: "text-[22px]" },
  lg: { icon: 34, text: "text-2xl" },
};

function CommunityIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Leaf / Tree canopy */}
      <path
        d="M20 4C20 4 8 14 8 22C8 28.627 13.373 34 20 34C26.627 34 32 28.627 32 22C32 14 20 4 20 4Z"
        fill="hsl(155 45% 32%)"
      />
      <path
        d="M20 4C20 4 14 16 14 22C14 26 16.5 30 20 34"
        stroke="hsl(155 35% 25%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Small root / trunk line */}
      <path
        d="M20 34V38"
        stroke="hsl(155 45% 32%)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Small community dots */}
      <circle cx="16" cy="20" r="1.5" fill="white" opacity="0.6" />
      <circle cx="24" cy="20" r="1.5" fill="white" opacity="0.6" />
      <circle cx="20" cy="16" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <CommunityIcon size={s.icon} />
      <span
        className={`font-[Plus_Jakarta_Sans] font-bold tracking-tight ${s.text}`}
        style={{ color: "hsl(155 45% 32%)" }}
      >
        JOINN
      </span>
    </span>
  );
}
