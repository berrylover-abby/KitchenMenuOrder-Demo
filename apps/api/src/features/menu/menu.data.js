// Interview seed data lives on the server. All prices are integer CAD cents.
export const menuItems = [
  { id: 'burger', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato and house sauce.', priceCents: 1250, category: 'Mains' },
  { id: 'chicken-wrap', name: 'Chicken Wrap', description: 'Grilled chicken, greens and garlic dressing.', priceCents: 1100, category: 'Mains' },
  { id: 'veggie-bowl', name: 'Veggie Bowl', description: 'Rice, roasted vegetables and tahini dressing.', priceCents: 1150, category: 'Mains' },
  { id: 'fries', name: 'Fries', description: 'Crispy potatoes with sea salt.', priceCents: 450, category: 'Sides' },
  { id: 'salad', name: 'Garden Salad', description: 'Mixed greens, cucumber and lemon vinaigrette.', priceCents: 550, category: 'Sides' },
  { id: 'soup', name: 'Tomato Soup', description: 'Roasted tomato soup with basil.', priceCents: 600, category: 'Sides' },
];

// Presentation metadata is served with the menu, not hardcoded in components.
for (const item of menuItems) {
  item.imageUrl = `/images/${item.id}.jpg`;
}
