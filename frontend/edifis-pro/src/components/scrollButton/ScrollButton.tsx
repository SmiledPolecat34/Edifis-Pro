import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ScrollButtonProps {
  scrollableRef: RefObject<HTMLDivElement>;
}

export default function ScrollButton({ scrollableRef }: ScrollButtonProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  useEffect(() => {
    const scrollableElement = scrollableRef.current;

    const handleScroll = () => {
      if (!scrollableElement) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

      const scrollTopVisible = scrollTop > 100;
      const scrollBottomVisible = scrollTop + clientHeight < scrollHeight - 1;

      setShowScrollTop(scrollTopVisible);
      setShowScrollBottom(scrollBottomVisible);
    };

    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    }

    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollableRef]);

  const scrollToTop = () => {
    scrollableRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollableRef.current?.scrollTo({
      top: scrollableRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Remonter en haut de la page"
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100 hover:scale-110"
        >
          <ArrowUp size={24} />
        </button>
      )}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Descendre en bas de la page"
          className="fixed bottom-24 right-8 z-50 h-12 w-12 rounded-full bg-gray-700 text-white shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100 hover:scale-110"
        >
          <ArrowDown size={24} />
        </button>
      )}
    </>
  );
}
