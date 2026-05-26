import { useEffect, useState } from 'react';

export default function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const initialHeight = viewport.height;
    const updateKeyboardState = () => {
      const heightDelta = window.innerHeight - viewport.height;
      const ratioDelta = initialHeight - viewport.height;
      setIsKeyboardVisible(heightDelta > 140 || ratioDelta > 140);
    };

    updateKeyboardState();
    viewport.addEventListener('resize', updateKeyboardState);
    viewport.addEventListener('scroll', updateKeyboardState);
    return () => {
      viewport.removeEventListener('resize', updateKeyboardState);
      viewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, []);

  return isKeyboardVisible;
}
