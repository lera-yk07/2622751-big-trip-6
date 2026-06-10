import { generateMockData, generateAllOffers } from '../mock/waypoint.js';

export default class TripModel {
  constructor(api = null) {
    this._api = api;
    this._waypoints = [];
    this._destinations = [];
    this._offersByWaypoint = {};
    this._allOffers = [];
    this._activeFilter = 'everything';
    this._activeSort = 'day';
    this._observers = [];
    this._isLoading = false;
    this._isError = false;

    if (!api) {
      const { waypoints, destinations, offersByWaypoint } = generateMockData();
      this._waypoints = waypoints;
      this._destinations = destinations;
      this._offersByWaypoint = offersByWaypoint;
      this._allOffers = generateAllOffers();
    }
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  _notifyObservers() {
    this._observers.forEach(observer => observer());
  }

  async init() {
    if (!this._api) return;
    
    this._isLoading = true;
    this._notifyObservers();

    try {
      const [waypoints, destinations, offers] = await Promise.all([
        this._api.getPoints(),
        this._api.getDestinations(),
        this._api.getOffers()
      ]);

      console.log('=== TRIP MODEL INIT ===');
      console.log('Destinations from server:', destinations);
      console.log('Waypoints from server:', waypoints);
      console.log('Offers from server:', offers);

      // Адаптация точек маршрута
      this._waypoints = waypoints.map(point => {
        // Парсим даты в UTC
        let dateFrom = point.date_from;
        let dateTo = point.date_to;
        
        // Если даты в формате ISO, оставляем как есть
        // Если нет, пробуем распарсить
        if (dateFrom && !dateFrom.includes('T')) {
          dateFrom = `${dateFrom}T00:00:00.000Z`;
        }
        if (dateTo && !dateTo.includes('T')) {
          dateTo = `${dateTo}T23:59:59.999Z`;
        }
        
        return {
          id: point.id,
          basePrice: point.base_price,
          dateFrom: dateFrom,
          dateTo: dateTo,
          destinationId: point.destination,
          isFavorite: point.is_favorite,
          optionsIds: point.offers || [],
          type: point.type
        };
      });
      
      // Адаптация направлений
      this._destinations = destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        description: dest.description || '',
        pictures: dest.pictures || []
      }));
      
      // Адаптация офферов
      this._allOffers = [];
      offers.forEach(typeOffer => {
        if (typeOffer.offers) {
          typeOffer.offers.forEach(offer => {
            this._allOffers.push({
              id: offer.id,
              title: offer.title,
              price: offer.price,
              type: typeOffer.type
            });
          });
        }
      });
      
      // Создаем offersByWaypoint для совместимости
      this._offersByWaypoint = {};
      this._waypoints.forEach(waypoint => {
        this._offersByWaypoint[waypoint.id] = this._allOffers.filter(offer => 
          waypoint.optionsIds && waypoint.optionsIds.includes(offer.id)
        );
      });
      
      console.log('Adapted waypoints:', this._waypoints);
      console.log('Adapted destinations:', this._destinations);
      console.log('Adapted offers:', this._allOffers);
      
      // Проверка парсинга дат
      console.log('Date parsing check:');
      this._waypoints.forEach(w => {
        console.log(`Point ${w.type}:`);
        console.log(`  dateFrom: ${w.dateFrom}`);
        console.log(`  parsed from: ${new Date(w.dateFrom)}`);
        console.log(`  dateTo: ${w.dateTo}`);
        console.log(`  parsed to: ${new Date(w.dateTo)}`);
      });
      
      this._isLoading = false;
      this._notifyObservers();
    } catch (error) {
      console.error('Init error:', error);
      this._isLoading = false;
      this._isError = true;
      this._notifyObservers();
    }
  }

  isLoading() {
    return this._isLoading;
  }

  isError() {
    return this._isError;
  }

  // Вспомогательный метод для получения даты без времени в UTC
  _getDateWithoutTime(dateString) {
    const date = new Date(dateString);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  getWaypoints() {
    console.log('=== GET WAYPOINTS ===');
    console.log('Active filter:', this._activeFilter);
    console.log('All waypoints before filter:', this._waypoints.map(w => ({
      type: w.type,
      dateFrom: w.dateFrom,
      dateTo: w.dateTo,
      isFavorite: w.isFavorite
    })));
    
    if (this._waypoints.length === 0) {
      console.log('No waypoints');
      return [];
    }
    
    let filteredWaypoints = [...this._waypoints];
    
    // Получаем текущую дату в UTC без времени
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    console.log('Current date UTC (without time):', todayUTC);
    
    switch (this._activeFilter) {
      case 'future':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          if (!waypoint.dateFrom) {
            console.log('Waypoint has no dateFrom:', waypoint);
            return false;
          }
          
          const waypointDate = new Date(waypoint.dateFrom);
          const waypointDateUTC = new Date(Date.UTC(
            waypointDate.getUTCFullYear(),
            waypointDate.getUTCMonth(),
            waypointDate.getUTCDate()
          ));
          
          const isFuture = waypointDateUTC >= todayUTC;
          console.log('Waypoint:', waypoint.type, 
            'original dateFrom:', waypoint.dateFrom,
            'UTC date:', waypointDateUTC,
            'today UTC:', todayUTC,
            'isFuture:', isFuture);
          return isFuture;
        });
        break;
      case 'past':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          if (!waypoint.dateTo) {
            console.log('Waypoint has no dateTo:', waypoint);
            return false;
          }
          
          const waypointDate = new Date(waypoint.dateTo);
          const waypointDateUTC = new Date(Date.UTC(
            waypointDate.getUTCFullYear(),
            waypointDate.getUTCMonth(),
            waypointDate.getUTCDate()
          ));
          
          const isPast = waypointDateUTC < todayUTC;
          console.log('Waypoint:', waypoint.type,
            'original dateTo:', waypoint.dateTo,
            'UTC date:', waypointDateUTC,
            'today UTC:', todayUTC,
            'isPast:', isPast);
          return isPast;
        });
        break;
      case 'everything':
      default:
        console.log('Everything filter - no filtering');
        break;
    }
    
    console.log('Filtered waypoints count:', filteredWaypoints.length);
    
    if (filteredWaypoints.length > 0) {
      switch (this._activeSort) {
        case 'day':
          filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
          break;
        case 'price':
          filteredWaypoints.sort((a, b) => b.basePrice - a.basePrice);
          break;
        default:
          filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
      }
    }
    
    return filteredWaypoints;
  }

  updateWaypoint(updatedWaypoint) {
    const index = this._waypoints.findIndex(waypoint => waypoint.id === updatedWaypoint.id);
    if (index !== -1) {
      this._waypoints[index] = { ...this._waypoints[index], ...updatedWaypoint };
      this._notifyObservers();
      return true;
    }
    return false;
  }

  addWaypoint(waypoint) {
    this._waypoints.push(waypoint);
    this._notifyObservers();
    return true;
  }

  deleteWaypoint(waypointId) {
    const index = this._waypoints.findIndex(waypoint => waypoint.id === waypointId);
    if (index !== -1) {
      this._waypoints.splice(index, 1);
      this._notifyObservers();
      return true;
    }
    return false;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffersForWaypoint(waypointId) {
    // Сначала пытаемся получить из offersByWaypoint (для моков)
    if (this._offersByWaypoint[waypointId]) {
      return this._offersByWaypoint[waypointId];
    }
    
    // Для серверных данных
    const waypoint = this._waypoints.find(w => w.id === waypointId);
    if (!waypoint || !waypoint.optionsIds) return [];
    
    return this._allOffers.filter(offer => 
      waypoint.optionsIds.includes(offer.id)
    );
  }

  getDestinationById(id) {
    console.log('getDestinationById called with id:', id);
    console.log('Available destinations:', this._destinations);
    
    if (!id) {
      console.log('No id, returning default');
      return { name: 'Unknown destination', description: '', pictures: [] };
    }
    
    let destination = this._destinations.find(dest => dest.id === id);
    
    // Если не нашли и id начинается с 'dest-', пробуем найти по индексу
    if (!destination && typeof id === 'string' && id.startsWith('dest-')) {
      const index = parseInt(id.split('-')[1]);
      destination = this._destinations[index];
    }
    
    console.log('Found destination:', destination);
    return destination || { name: 'Unknown destination', description: '', pictures: [] };
  }

  getAllOffers() {
    return this._allOffers;
  }

  getFilters() {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const hasFuture = this._waypoints.some(waypoint => {
      if (!waypoint.dateFrom) return false;
      const waypointDate = new Date(waypoint.dateFrom);
      const waypointDateUTC = new Date(Date.UTC(
        waypointDate.getUTCFullYear(),
        waypointDate.getUTCMonth(),
        waypointDate.getUTCDate()
      ));
      return waypointDateUTC >= todayUTC;
    });
    
    const hasPast = this._waypoints.some(waypoint => {
      if (!waypoint.dateTo) return false;
      const waypointDate = new Date(waypoint.dateTo);
      const waypointDateUTC = new Date(Date.UTC(
        waypointDate.getUTCFullYear(),
        waypointDate.getUTCMonth(),
        waypointDate.getUTCDate()
      ));
      return waypointDateUTC < todayUTC;
    });
    
    console.log('Filters check:', {
      totalWaypoints: this._waypoints.length,
      hasFuture,
      hasPast,
      todayUTC
    });
    
    return [
      {
        type: 'everything',
        name: 'Everything',
        isActive: this._activeFilter === 'everything',
        isDisabled: false,
        emptyMessage: 'Click New Event to create your first point'
      },
      {
        type: 'future',
        name: 'Future',
        isActive: this._activeFilter === 'future',
        isDisabled: !hasFuture,
        emptyMessage: 'There are no future events now'
      },
      {
        type: 'past',
        name: 'Past',
        isActive: this._activeFilter === 'past',
        isDisabled: !hasPast,
        emptyMessage: 'There are no past events now'
      }
    ];
  }

  getSort() {
    return [
      { type: 'day', name: 'Day', isActive: this._activeSort === 'day', isDisabled: false },
      { type: 'event', name: 'Event', isActive: false, isDisabled: true },
      { type: 'time', name: 'Time', isActive: false, isDisabled: true },
      { type: 'price', name: 'Price', isActive: this._activeSort === 'price', isDisabled: false },
      { type: 'offers', name: 'Offers', isActive: false, isDisabled: true }
    ];
  }

  setFilter(filterType) {
    console.log('setFilter called:', filterType);
    if (this._activeFilter !== filterType) {
      this._activeFilter = filterType;
      this._activeSort = 'day';
      this._notifyObservers();
    }
  }

  setSort(sortType) {
    if (this._activeSort !== sortType) {
      this._activeSort = sortType;
      this._notifyObservers();
    }
  }

  getActiveFilter() {
    return this._activeFilter;
  }

  getActiveSort() {
    return this._activeSort;
  }
}
