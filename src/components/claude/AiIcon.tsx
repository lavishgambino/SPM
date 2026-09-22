import { SVGProps } from "react";

/**
 * Filled AI icon — a four-point sparkle/star used everywhere we previously
 * used lucide's outlined `Sparkles` to indicate AI-generated content.
 */
export function AiIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Main 4-point sparkle */}
      <path d="M12 2c.4 0 .76.24.92.6l1.7 3.96a4 4 0 0 0 2.12 2.12l3.96 1.7a1 1 0 0 1 0 1.84l-3.96 1.7a4 4 0 0 0-2.12 2.12l-1.7 3.96a1 1 0 0 1-1.84 0l-1.7-3.96a4 4 0 0 0-2.12-2.12l-3.96-1.7a1 1 0 0 1 0-1.84l3.96-1.7a4 4 0 0 0 2.12-2.12l1.7-3.96A1 1 0 0 1 12 2Z" />
      {/* Small accent sparkle */}
      <path d="M19 15.5c.2 0 .38.12.46.3l.55 1.28c.13.3.37.54.67.67l1.28.55a.5.5 0 0 1 0 .92l-1.28.55a1.2 1.2 0 0 0-.67.67l-.55 1.28a.5.5 0 0 1-.92 0l-.55-1.28a1.2 1.2 0 0 0-.67-.67l-1.28-.55a.5.5 0 0 1 0-.92l1.28-.55c.3-.13.54-.37.67-.67l.55-1.28a.5.5 0 0 1 .46-.3Z" />
    </svg>
  );
}

export default AiIcon;
