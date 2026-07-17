/**
 * Illustrated "valley" hero backdrop built entirely from CSS/SVG — soft sky
 * gradient, layered rolling hills, and a couple of floating cloud blobs in
 * the brand's rainbow palette. No image asset, so there's zero network
 * request and zero CLS risk.
 */
export function HeroIllustrationBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-100 to-beige" />

      <svg
        className="absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 200C240 260 360 120 620 160C880 200 1000 100 1440 180V320H0V200Z"
          className="fill-teal-100/70"
        />
        <path
          d="M0 260C280 200 420 280 700 230C980 180 1140 260 1440 220V320H0V260Z"
          className="fill-sage-100/80"
        />
        <path
          d="M0 300C320 260 480 320 760 290C1040 260 1200 310 1440 280V320H0V300Z"
          className="fill-ink-100"
        />
      </svg>

      <div className="animate-float-sm absolute left-[8%] top-[14%] h-14 w-24 rounded-full bg-white/70 blur-[1px] xs:h-16 xs:w-28" />
      <div className="animate-float absolute right-[12%] top-[22%] h-10 w-20 rounded-full bg-white/60 blur-[1px] xs:h-12 xs:w-24" />
      <div className="animate-float-sm absolute left-[38%] top-[8%] h-8 w-16 rounded-full bg-white/50 blur-[1px] [animation-delay:1s]" />

      <div className="absolute -left-10 top-1/3 h-40 w-40 rounded-full bg-blossom-100/40 blur-2xl" />
      <div className="absolute -right-10 top-1/4 h-48 w-48 rounded-full bg-sunny-100/50 blur-2xl" />
      <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-lemon-100/40 blur-2xl" />
    </div>
  );
}
