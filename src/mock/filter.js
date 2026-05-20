export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PAST: 'past'
};

export const generateFilters = (waypoints) => {
  // Проверяем, есть ли точки в будущем и прошлом
  const now = new Date();
  const hasFuture = waypoints.some(waypoint => new Date(waypoint.dateFrom) > now);
  const hasPast = waypoints.some(waypoint => new Date(waypoint.dateTo) < now);

  return [
    {
      type: FilterType.EVERYTHING,
      name: 'Everything',
      isActive: true,
      isDisabled: false,
      count: waypoints.length
    },
    {
      type: FilterType.FUTURE,
      name: 'Future',
      isActive: false,
      isDisabled: !hasFuture,
      count: waypoints.filter(waypoint => new Date(waypoint.dateFrom) > now).length
    },
    {
      type: FilterType.PAST,
      name: 'Past',
      isActive: false,
      isDisabled: !hasPast,
      count: waypoints.filter(waypoint => new Date(waypoint.dateTo) < now).length
    }
  ];
};