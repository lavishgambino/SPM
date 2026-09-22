import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical Share button used across the app. Matches the design spec:
 * - Solid #4644D8 (primary) pill, ~28px tall, 8px radius
 * - White "Share" label + person-with-plus icon
 *
 * Use this everywhere a labeled "Share" action appears so the treatment
 * stays consistent.
 */
export const ShareButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={props["aria-label"] ?? "Share"}
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-lg",
        "bg-[#4644D8] text-white text-[13px] font-semibold leading-none",
        "hover:bg-[#3D3BC4] active:bg-[#3633B0] transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#4644D8]/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      <ShareIcon className="w-3.5 h-3.5" />
      <span>{children ?? "Share"}</span>
    </button>
  );
});
ShareButton.displayName = "ShareButton";

/** Person-with-plus glyph from the supplied Share button SVG. */
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Plus */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6329 3.0467c.3866 0 .7.3134.7.7v.9671h.9672c.3866 0 .7.3134.7.7s-.3134.7-.7.7h-.9672v.9672c0 .3866-.3134.7-.7.7s-.7-.3134-.7-.7v-.9672h-.9672c-.3866 0-.7-.3134-.7-.7s.3134-.7.7-.7h.9672v-.9671c0-.3866.3134-.7.7-.7Z"
        fill="currentColor"
      />
      {/* Body */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10.4536c0-1.9706 1.59754-3.5682 3.5682-3.5682h3.2528c1.9707 0 3.5683 1.5976 3.5683 3.5682 0 .3866-.3134.7-.7.7s-.7-.3134-.7-.7c0-1.1974-.9708-2.1682-2.1683-2.1682H3.5682c-1.19746 0-2.1682.9708-2.1682 2.1682H0Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.4 10.4536v.1402c0 .3866-.3134.7-.7.7s-.7-.3134-.7-.7v-.1402c.32816 0 .92191 0 1.4 0Z"
        fill="currentColor"
      />
      {/* Head */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.1945 1.40555c.954 0 1.7272.77332 1.7272 1.72702 0 .9538-.7732 1.7271-1.7272 1.7271-.9537 0-1.7269-.7733-1.7269-1.7271 0-.9538.7732-1.72702 1.7269-1.72702Zm3.1272 1.72702C8.3217 1.40558 6.9217.00552 5.1945.00552c-1.7269 0-3.12693 1.40011-3.12693 3.12705 0 1.72693 1.40003 3.12703 3.12693 3.12703 1.7272 0 3.1272-1.4001 3.1272-3.12703Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ShareButton;
