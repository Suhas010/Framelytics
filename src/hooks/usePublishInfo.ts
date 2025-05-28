import { useState, useEffect } from 'react';
import { framer } from 'framer-plugin';

// Define our expected publish info structure
interface PublishInfoStructure {
  staging?: {
    currentPageUrl?: string;
  };
  published?: {
    currentPageUrl?: string;
  };
  site?: {
    title?: string;
  };
}

/**
 * Custom hook for subscribing to Framer publish information
 * @returns The current publish information
 */
export function usePublishInfo() {
  // Use unknown type and cast later
  const [publishInfo, setPublishInfo] = useState<unknown>(null);

  useEffect(() => {
    // Use a more specific type for the callback parameter
    type FramerPublishInfoCallback = (info: object) => void;
    
    // Create a callback that sets state and cast it to the expected type
    const callback = ((info: unknown) => {
      setPublishInfo(info);
    }) as FramerPublishInfoCallback;
    
    return framer.subscribeToPublishInfo(callback);
  }, []);

  // Cast to our expected structure when returning
  return publishInfo as PublishInfoStructure;
} 