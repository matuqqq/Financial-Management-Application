export interface Item {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: {
    id: number;
    name: string;
  };
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
}
