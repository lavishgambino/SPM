import { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  trailing?: ReactNode;
}

/**
 * Shared page header. Geometry comes from CSS custom properties written by
 * LayoutVarsProvider, so this component never computes padding itself.
 */
const PageHeader = ({ title, trailing }: PageHeaderProps) => {
  return (
    <div
      className="flex items-center bg-transparent flex-shrink-0"
      style={{
        height: "var(--header-height)",
        paddingLeft: 32,
        paddingTop: "var(--header-top)",
        paddingRight: 16,
      }}
    >
      <div className="flex items-center gap-1.5 min-w-0 max-w-full">
        {typeof title === "string" ? (
          <span className="text-base font-semibold text-foreground truncate">{title}</span>
        ) : (
          title
        )}
      </div>
      {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
    </div>
  );
};

export default PageHeader;
