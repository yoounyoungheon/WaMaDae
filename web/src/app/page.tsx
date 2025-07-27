import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="grid grid-cols-2 text-white font-semibold">
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
          imgs={["/carrot2.jpeg", "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
          tags={['willow', 'wine']}/>
        <InfoCard 
          title="오린트 성수" 
          description="오렌지와 민트가 어우러진 상큼한 화이트 와인"
          stars={3}
          imgs={[ "/carrot4.jpeg", "/carrot5.jpeg","/carrot6.jpeg", "/carrot7.jpeg"]}
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

function InfoCard({ title, description, stars, imgs, tags }: { title: string, description: string, stars: number, imgs: string[], tags: string[] }) {
  
    return (
      <div className="flex flex-col gap-2 bg-white py-3 px-5 text-left">
        <div className="font-bold">{title}</div>

        <div className="flex flex-row gap-2 items-center text-sm"> 
          <div className="text-gray-500">{`⭐️ ${stars}`}</div>
        </div>

        <div className="font-semibold text-sm text-gray-500">{description}</div>

        <div className="overflow-x-scroll w-full">
          <div className="flex flex-row gap-1 min-w-max">
            {imgs.map((img, index) => (
            <div
                key={index}
                className={`relative aspect-[5/3] w-[300px] ${index===0?'rounded-l-lg':null} ${index===imgs.length-1?'rounded-r-lg':null} overflow-hidden flex-shrink-0`}
            >
                <Image src={img} alt={title} fill className="object-cover" />
            </div>
            ))}
          </div>
        </div>

  
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