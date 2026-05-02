export const SORT_ORDERS = {
  name: 'name',
  recent: 'recent',
} as const;

export const SORT_ORDER_LABELS: Record<string, string> = {
  name: 'By Name',
  recent: 'Most Recent',
};
