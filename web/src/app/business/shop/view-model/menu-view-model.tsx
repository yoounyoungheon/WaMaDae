export interface MenuViewModel {
  id: number
  name: string
  price: string
  category: string[]
  description: string
  imageUrl: string
  sequenceNumber: number
}

export const createMenuViewModel = ({id, name, price, category, description, imageUrl, sequenceNumber: order}:MenuViewModel): MenuViewModel => {
  return {
    id,
    name,
    price,
    category,
    description,
    imageUrl,
    sequenceNumber: order
  }
}