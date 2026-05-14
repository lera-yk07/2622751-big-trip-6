const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Типы точек маршрута
export const WaypointType = {
  TAXI: 'taxi',
  BUS: 'bus',
  TRAIN: 'train',
  SHIP: 'ship',
  DRIVE: 'drive',
  FLIGHT: 'flight',
  CHECK_IN: 'check-in',
  SIGHTSEEING: 'sightseeing',
  RESTAURANT: 'restaurant'
};

// Города
const cities = ['Chamonix', 'Geneva', 'Paris', 'Amsterdam', 'Berlin', 'Rome', 'London'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(-7, 7));
  return date;
};

// Описания из задания
const descriptionParagraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.'
];

const generateDestination = (id, name) => ({
  id,
  name,
  description: descriptionParagraphs.slice(0, getRandomInt(1, 5)).join(' '),
  pictures: Array.from({ length: getRandomInt(1, 4) }, (_, idx) => ({
    src: `https://loremflickr.com/248/152?random=${id * 100 + idx}`,
    description: `${name} view ${idx + 1}`
  }))
});

const generateOffers = (waypointId) => {
  const offerTitles = ['Add luggage', 'Comfort class', 'Meal', 'Priority boarding', 'Wi-Fi', 'Transfer'];
  return Array.from({ length: getRandomInt(2, 4) }, (_, idx) => ({
    id: `${waypointId}-offer-${idx}`,
    title: offerTitles[idx % offerTitles.length],
    price: getRandomInt(10, 150)
  }));
};

export const generateWaypoint = (index) => {
  const id = generateId(); // Вместо nanoid()
  const destinationId = `dest-${index}`;
  const types = Object.values(WaypointType);
  const startDate = getRandomDate();
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + getRandomInt(1, 5));

  return {
    id,
    type: types[getRandomInt(0, types.length - 1)],
    destinationId,
    optionsIds: [],
    dateFrom: startDate.toISOString(),
    dateTo: endDate.toISOString(),
    basePrice: getRandomInt(50, 500),
    isFavorite: Math.random() > 0.8
  };
};

export const generateMockData = () => {
  const destinations = [];
  const offersByWaypoint = {};
  const waypoints = [];

  const waypointCount = getRandomInt(3, 5);

  for (let i = 0; i < waypointCount; i++) {
    const waypoint = generateWaypoint(i);
    waypoints.push(waypoint);

    if (!destinations.some(d => d.id === waypoint.destinationId)) {
      const cityName = cities[i % cities.length];
      destinations.push(generateDestination(waypoint.destinationId, cityName));
    }

    const offers = generateOffers(waypoint.id);
    offersByWaypoint[waypoint.id] = offers;
    waypoint.optionsIds = offers.map(o => o.id);
  }

  return { waypoints, destinations, offersByWaypoint };
};