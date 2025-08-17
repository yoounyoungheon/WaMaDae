export const ShopHeader = ({headerTitle}:{headerTitle:string}) => {
  return (
    <div className="bg-white px-5 py-3 text-center font-semibold text-lg border-b-2">
      <div> 
        <p>{headerTitle}</p>
      </div>
    </div>
  )
}