'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

export function MainCarouselView() {
  const carrots = ["/carrot1.png", "/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carrots.length);
        setIsSliding(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [carrots.length]);

  return (
    <div className="relative w-full aspect-square mb-4 overflow-hidden">
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          isSliding ? "-translate-x-full" : "translate-x-0"
        }`}
        key={currentIndex}
      >
        <Image
          src={carrots[currentIndex]}
          alt={`Carousel Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />
      </div>
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          isSliding ? "translate-x-0" : "translate-x-full"
        }`}
        key={currentIndex + 1}
      >
        <Image
          src={carrots[(currentIndex + 1) % carrots.length]}
          alt={`Carousel Image ${currentIndex + 2}`}
          fill
          className="object-cover"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carrots.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}