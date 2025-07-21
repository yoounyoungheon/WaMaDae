import { InfoCard } from "./ui/component/InfoCard";

export default function Home() {
  return (
    <div className="w-[350px] bg-white">

      <div className="grid grid-cols-2 text-white font-bold">
        <div className="bg-red-900 p-3 text-center">와인 검색</div>
        <div className="bg-sky-950 p-3 text-center">오 술 추</div>
      </div>
    
      <div className="flex flex-col overflow-y-scroll gap-1 bg-gray-100 w-full text-center">
        <InfoCard 
          title="오린트 성수" 
          description="오렌지와 민트가 어우러진 상큼한 화이트 와인"
          stars={3.8}
          imgs={["/carrot1.png", "/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
          tags={['willow', 'wine', 'wisky']}/>
        <InfoCard 
          title="오린트 성수" 
          description="오렌지와 민트가 어우러진 상큼한 화이트 와인"
          stars={3}
          imgs={["/carrot1.png", "/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
          tags={['willow', 'wine']}/>
        <InfoCard 
          title="오린트 성수" 
          description="오렌지와 민트가 어우러진 상큼한 화이트 와인"
          stars={3}
          imgs={["/carrot1.png", "/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
          tags={['willow', 'wine']}/>
        <InfoCard 
          title="오린트 성수" 
          description="오렌지와 민트가 어우러진 상큼한 화이트 와인"
          stars={3}
          imgs={["/carrot1.png", "/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
          tags={['willow', 'wine']}/>
      </div>
      
    </div>
  );
}

