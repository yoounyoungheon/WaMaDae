'use client';

import { useState, useEffect } from "react";
import Cattot1 from "@/app/assets/carrot1.png";
import Cattot2 from "@/app/assets/carrot2.jpeg";
import Cattot4 from "@/app/assets/carrot4.jpeg";
import Cattot5 from "@/app/assets/carrot5.jpeg";
import Cattot6 from "@/app/assets/carrot6.jpeg";
import Cattot7 from "@/app/assets/carrot7.jpeg";
import Image from "next/image";

export function MainCarouselView() {
  const carrots = [Cattot1.src, Cattot2.src, Cattot4.src, Cattot5.src, Cattot6.src, Cattot7.src];
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