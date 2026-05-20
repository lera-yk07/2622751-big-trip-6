export const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers'
};

export const generateSort = () => {
  return [
    {
      type: SortType.DAY,
      name: 'Day',
      isActive: true,
      isDisabled: false
    },
    {
      type: SortType.EVENT,
      name: 'Event',
      isActive: false,
      isDisabled: true
    },
    {
      type: SortType.TIME,
      name: 'Time',
      isActive: false,
      isDisabled: true
    },
    {
      type: SortType.PRICE,
      name: 'Price',
      isActive: false,
      isDisabled: false
    },
    {
      type: SortType.OFFERS,
      name: 'Offers',
      isActive: false,
      isDisabled: true
    }
  ];
};