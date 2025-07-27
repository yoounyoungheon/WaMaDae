'use client'
import Carousel from 'react-material-ui-carousel';

export function ShopCarousel() {
  const items = [
      { name: "광고 1", description: "광고 들어갈 자리" },
      { name: "광고 2", description: "광고 들어갈 자리" },
      { name: "광고 3", description: "광고 들어갈 자리" }
  ];
  return (
    <Carousel
      navButtonsAlwaysInvisible={true}
      interval={3000}
      animation="slide"
      autoPlay={true}
      sx={{
        backgroundColor: 'lightgray',
        borderRadius: '12px',
        overflow: 'hidden'
    }}>
      {items.map((item, index) => 
        <div key={index} className="flex flex-col items-center justify-center h-full p-5 ">
          <h2 className="text-lg font-bold">{item.name}</h2>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>)}
    </Carousel>
  )  
}