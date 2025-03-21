import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  className?: string;
}

export default function Pagination({ links, className = '' }: PaginationProps) {
  // Don't render pagination if there are no links or just one page
  if (!links || links.length <= 3) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {links.map((link, key) => {
        // Skip the "&laquo; Previous" and "Next &raquo;" labels when they don't have URLs
        if ((!link.url && (key === 0 || key === links.length - 1))) {
          return null;
        }

        // Create proper buttons for pagination
        return (
          <Link
            key={key}
            href={link.url || '#'}
            className={cn(
              "px-4 py-2 text-sm border rounded-md transition-colors",
              {
                "bg-primary text-primary-foreground border-primary hover:bg-primary/90": link.active,
                "bg-background border-input hover:bg-accent hover:text-accent-foreground": !link.active && link.url,
                "bg-muted text-muted-foreground cursor-not-allowed": !link.url,
              }
            )}
            preserveState
            only={['courses', 'filters']}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        );
      })}
    </div>
  );
} 