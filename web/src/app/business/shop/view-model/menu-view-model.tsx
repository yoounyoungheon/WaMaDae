export interface WineViewModel {
  id: string
  name: string
  price: string
  category: string[]
  description: string
  imageUrl: string
}

export const createWineViewModel = ({id, name, price, category, description, imageUrl}:WineViewModel): WineViewModel => {
  return {
    id: id,
    name: name,
    price:price,
    category: category,
    description: description,
    imageUrl: imageUrl,
  }
}