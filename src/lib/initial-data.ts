import type { BackyardLayout } from './types';

export const initialData: BackyardLayout = {
  queenAndKingPalms: {
    name: 'Queen and King Palms',
    color: '#DC2626',
    plants: [
      { id: 'qkp-a', label: 'A', type: 'Queen Palm', position: { x: 40, y: 85 }, records: [{ id: 1, date: '2025-02-22', treatment: 'Palm Gain 8-2-12', notes: '', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-b', label: 'B', type: 'King Palm', position: { x: 45, y: 85 }, records: [{ id: 2, date: '2025-02-23', treatment: 'Palm Gain 8-2-12', notes: '', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-c', label: 'C', type: 'Queen Palm', position: { x: 50, y: 85 }, records: [{ id: 3, date: '2025-02-24', treatment: 'Palm Gain 8-2-12', notes: '', phLevel: '', moistureLevel: '' }, { id: 4, date: '2025-03-04', treatment: 'Magnesium', notes: '4 TBSP', phLevel: '', moistureLevel: '' }, { id: 5, date: '2025-03-04', treatment: 'Manganese', notes: '6 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-d', label: 'D', type: 'King Palm', position: { x: 20, y: 55 }, records: [{ id: 6, date: '2025-03-04', treatment: 'Magnesium', notes: '4 TBSP', phLevel: '', moistureLevel: '' }, { id: 7, date: '2025-03-04', treatment: 'Manganese', notes: '6 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-e', label: 'E', type: 'Queen Palm', position: { x: 20, y: 40 }, records: [{ id: 8, date: '2025-03-04', treatment: 'Magnesium', notes: '4 TBSP', phLevel: '', moistureLevel: '' }, { id: 9, date: '2025-03-04', treatment: 'Manganese', notes: '6 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-f', label: 'F', type: 'King Palm', position: { x: 18, y: 25 }, records: [{ id: 10, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }, { id: 11, date: '2025-03-04', treatment: 'Manganese', notes: '12 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-g', label: 'G', type: 'Queen Palm', position: { x: 25, y: 15 }, records: [{ id: 12, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }, { id: 13, date: '2025-03-04', treatment: 'Manganese', notes: '12 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-h', label: 'H', type: 'King Palm', position: { x: 60, y: 12 }, records: [{ id: 14, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }, { id: 15, date: '2025-03-04', treatment: 'Manganese', notes: '6 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-i', label: 'I', type: 'Queen Palm', position: { x: 70, y: 12 }, records: [{ id: 16, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }, { id: 17, date: '2025-03-04', treatment: 'Manganese', notes: '6 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-j', label: 'J', type: 'King Palm', position: { x: 80, y: 15 }, records: [{ id: 18, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }, { id: 19, date: '2025-03-04', treatment: 'Manganese', notes: '8 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-k', label: 'K', type: 'Queen Palm', position: { x: 88, y: 28 }, records: [{ id: 20, date: '2025-03-04', treatment: 'Magnesium', notes: '4 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-l', label: 'L', type: 'King Palm', position: { x: 90, y: 45 }, records: [{ id: 21, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-m', label: 'M', type: 'Queen Palm', position: { x: 88, y: 65 }, records: [{ id: 22, date: '2025-03-04', treatment: 'Magnesium', notes: '7 TBSP', phLevel: '', moistureLevel: '' }] },
      { id: 'qkp-n', label: 'N', type: 'King Palm', position: { x: 85, y: 80 }, records: [{ id: 23, date: '2025-03-04', treatment: 'Magnesium', notes: '4 TBSP', phLevel: '', moistureLevel: '' }] }
    ]
  },
  bamboo: {
    name: 'Bamboo',
    color: '#16A34A',
    plants: [
      { id: 'bmb-a', label: 'A', type: 'Bamboo', position: { x: 30, y: 85 }, records: [] },
      { id: 'bmb-b', label: 'B', type: 'Bamboo', position: { x: 35, y: 85 }, records: [] }
    ]
  },
  fruit: {
    name: 'Fruit Trees',
    color: '#F97316',
    plants: [
      { id: 'frt-a', label: 'A', type: 'Fruit Tree', position: { x: 25, y: 70 }, records: [] }
    ]
  },
  shrubs: {
    name: 'Shrubs',
    color: '#6366F1',
    plants: [
       { id: 'shb-a', label: 'A', type: 'Shrub', position: { x: 22, y: 80 }, records: [] },
    ]
  },
  tropicals: {
    name: 'Tropicals',
    color: '#A855F7',
    plants: [
        { id: 'trp-a', label: 'A', type: 'Pygmy Palm', position: { x: 25, y: 30 }, records: [] }
    ]
  }
};
