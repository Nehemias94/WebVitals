export type Product = {
  id: number | string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  stock: number | null;
  category: string | null;
};

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export type User = {
  id: number | string;
  name: string;
  email: string;
};

export type OrderItem = {
  productId: number | string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number | string;
  status: string;
  total: number;
  createdAt: string | null;
  items: OrderItem[];
};

export type CartItem = {
  productId: number | string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number | null;
};

/** Estado devuelto por los formularios que usan Server Actions. */
export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};
