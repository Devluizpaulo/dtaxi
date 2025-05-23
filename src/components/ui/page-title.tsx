
import React from 'react';
import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

export function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    // Update the document title
    const previousTitle = document.title;
    document.title = title;
    
    // Restore the previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
  
  // This component doesn't render anything visible
  return null;
}
