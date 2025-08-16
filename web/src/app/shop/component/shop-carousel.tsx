'use client'
import Carousel from 'react-material-ui-carousel';
import Image from 'next/image';

export function ShopCarousel() {
  const items = [
      { name: "광고 1", image: "/carrot1.png" },
      { name: "광고 2", image: "/carrot2.jpeg"},
      { name: "광고 3", image: "/carrot4.jpeg" }
  ];
  return (
    <Carousel
      indicators={false}
      interval={2000}
      animation="slide"
      autoPlay={true}
      sx={{
        backgroundColor: 'lightgray',
        borderRadius: '12px',
        overflow: 'hidden'
    }}>
      {items.map((item, index) => 
        <div key={index} className="flex flex-col items-center justify-center aspect-[5/3] ">
          <h2 className="text-lg font-bold">{item.name}</h2>
          <Image
            alt="메뉴 이미지를 불러오지 못했습니다."
            src={item.image}
            fill
            className="object-cover"
          />
        </div>)}
    </Carousel>
  )  
}