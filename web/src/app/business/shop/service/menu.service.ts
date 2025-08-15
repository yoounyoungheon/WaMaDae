'use server'
import { createMenuViewModel } from "../view-model/menu-view-model"

export const getShopMenus =  async (shopId: number) => {
  // api 요청 로직
  console.log(shopId)

  const menuViewModels = [
    createMenuViewModel({
      id: 1,
      name: '대파 명란 파스타',
      price: '15,000 원',
      category: ['명란', '크리미', 'white wine'],
      description: '대파 명란의 감칠맛에 우렁을 더한 풍미 깊은 파스타',
      imageUrl: '/carrot1.png'
    }),
    createMenuViewModel({
      id: 2,
      name: '우설 스테이크',
      price: '30,000 원',
      category: ['소고기', '풍미', 'red wine'],
      description: '육즙 가득한 살치살을 두툼하게 구워낸 스테이크(200g 기준)',
      imageUrl: '/carrot2.jpeg'
    })
  ]

  return menuViewModels
}