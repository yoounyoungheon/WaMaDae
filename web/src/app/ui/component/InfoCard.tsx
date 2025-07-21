'use client';

import Carousel from "react-material-ui-carousel/dist/components/Carousel";
import Image from "next/image";

export function InfoCard({ title, description, stars, imgs, tags }: { title: string, description: string, stars: number, imgs: string[], tags: string[] }) {
  
    return (
      <div className="flex flex-col gap-2 bg-white py-3 px-5 text-left">
        <div className="font-bold">{title}</div>

        <div className="flex flex-row gap-2 items-center text-sm"> 
          <div className="text-gray-500">{`⭐️ ${stars}`}</div>
        </div>

        <div className="font-semibold text-sm text-gray-500">{description}</div>
        
        <Carousel navButtonsAlwaysVisible={false} autoPlay={false} animation="slide" indicators={false} swipe={true} className="w-full">
          {imgs.map((img, index) => (
            <div key={index} className="aspect-[5/3] relative z-0 rounded-lg overflow-hidden">
              <Image
                src={img} 
                alt={title} 
                fill
              />
            </div>
          ))}
        </Carousel>
  
        <div className="grid grid-cols-5 gap-1">
          {tags.map((tag, index) => (
            <div key={index} className="bg-white text-sky-950 border border-slate-400 px-2 py-1 rounded-full text-xs text-center font-semibold">
              {tag}
            </div>
          ))}
        </div>
        
      </div>
    );
  }