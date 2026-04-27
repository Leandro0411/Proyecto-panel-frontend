export const PRODUCT_CATEGORIES = [
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'electrodomesticos', label: 'Electrodomesticos' },
  { value: 'accesorios para autos', label: 'Accesorios para autos' }
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];
