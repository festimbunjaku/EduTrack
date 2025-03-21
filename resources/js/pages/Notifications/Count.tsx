import { PageProps } from "@/types";

interface CountProps extends PageProps {
  count: number;
}

export default function Count({ count }: CountProps) {
  // This is a minimal component that just receives the count
  // We don't render anything here since this is just used for Inertia data fetching
  return null;
} 
 