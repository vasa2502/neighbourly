/**
 * Skip-to-content link for screen readers and keyboard navigation.
 * Renders a visually hidden link that becomes visible on focus.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:border focus:border-border focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

/**
 * Visually hidden text for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Adds a landmark ID to the main content area
 */
export function MainContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main id="main-content" tabIndex={-1} className={className}>
      {children}
    </main>
  );
}

/**
 * ARIA live region for dynamic announcements
 */
export function LiveRegion({
  message,
  politeness = "polite",
}: {
  message: string;
  politeness?: "polite" | "assertive";
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
