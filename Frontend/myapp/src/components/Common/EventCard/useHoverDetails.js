import { useEffect, useRef, useState } from "react";
import fetchEvents from "./FetchEvent";

const useHoverDetails = (item) => {
  const [isHovered, setIsHovered] = useState(false);
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hoverTimeout = useRef(null);
  const hideTimeout = useRef(null);

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    hoverTimeout.current = setTimeout(async () => {
      setIsHovered(true);

      // fetch only once per card
      if (!details) {
        setIsLoading(true);
        try {
          const data = await fetchEvents(item);
          setDetails(data);
        } catch (err) {
          console.error("Hover fetch failed:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    hideTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return {
    isHovered,
    details,
    isLoading,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useHoverDetails;
