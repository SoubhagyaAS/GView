export const statusColors = {
  'not-started': '#6B7280',
  'in-progress': '#3B82F6',
  'completed': '#10B981',
  'on-hold': '#F59E0B',
  'cancelled': '#EF4444'
};

export const priorityColors = {
  'low': '#10B981',
  'medium': '#F59E0B',
  'high': '#F97316',
  'critical': '#EF4444'
};

export const typeColors = {
  'phase': '#8B5CF6',
  'milestone': '#F59E0B',
  'task': '#3B82F6'
};

export const approvalColors = {
  'pending': '#F59E0B',
  'approved': '#10B981',
  'rejected': '#EF4444',
  'not-required': '#6B7280'
};

export const generateItemColor = (type: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};