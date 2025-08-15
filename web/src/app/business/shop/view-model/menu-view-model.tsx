export interface MenuViewModel {
  id: number
  name: string
  price: string
  category: string[]
  description: string
  imageUrl: string
}

export const createMenuViewModel = ({id, name, price, category, description, imageUrl}:MenuViewModel): MenuViewModel => {
  return {
    id: id,
    name: name,
    price:price,
    category: category,
    description: description,
    imageUrl: imageUrl,
  }
}