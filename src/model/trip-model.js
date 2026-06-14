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

      this._waypoints = waypoints;
      this._destinations = destinations;
      
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

  getWaypoints() {
    let filteredWaypoints = [...this._waypoints];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (this._activeFilter) {
      case 'future':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          const waypointDate = new Date(waypoint.dateFrom);
          waypointDate.setHours(0, 0, 0, 0);
          return waypointDate >= now;
        });
        break;
      case 'past':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          const waypointDate = new Date(waypoint.dateTo);
          waypointDate.setHours(0, 0, 0, 0);
          return waypointDate < now;
        });
        break;
      case 'everything':
      default:
        break;
    }
    
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
    
    return filteredWaypoints;
  }

  async updateWaypoint(updatedWaypoint) {
    try {
      const updatedPoint = await this._api.updatePoint(updatedWaypoint);
      const index = this._waypoints.findIndex(waypoint => waypoint.id === updatedPoint.id);
      if (index !== -1) {
        this._waypoints[index] = updatedPoint;
        this._notifyObservers();
      }
      return { success: true, data: updatedPoint };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: error.message };
    }
  }

  async createWaypoint(waypoint) {
    try {
      const newPoint = await this._api.createPoint(waypoint);
      this._waypoints.push(newPoint);
      this._notifyObservers();
      return { success: true, data: newPoint };
    } catch (error) {
      console.error('Create error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteWaypoint(waypointId) {
    try {
      await this._api.deletePoint(waypointId);
      const index = this._waypoints.findIndex(waypoint => waypoint.id === waypointId);
      if (index !== -1) {
        this._waypoints.splice(index, 1);
        this._notifyObservers();
      }
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  getDestinations() {
    return this._destinations;
  }

  getOffersForWaypoint(waypointId) {
    const waypoint = this._waypoints.find(w => w.id === waypointId);
    if (!waypoint || !waypoint.optionsIds) return [];
    
    return this._allOffers.filter(offer => 
      waypoint.optionsIds.includes(offer.id)
    );
  }

  getDestinationById(id) {
    if (!id) return { name: 'Unknown', description: '', pictures: [] };
    const destination = this._destinations.find(dest => dest.id === id);
    return destination || { name: 'Unknown', description: '', pictures: [] };
  }

  getAllOffers() {
    return this._allOffers;
  }

  getFilters() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const hasFuture = this._waypoints.some(waypoint => {
      const waypointDate = new Date(waypoint.dateFrom);
      waypointDate.setHours(0, 0, 0, 0);
      return waypointDate >= now;
    });
    
    const hasPast = this._waypoints.some(waypoint => {
      const waypointDate = new Date(waypoint.dateTo);
      waypointDate.setHours(0, 0, 0, 0);
      return waypointDate < now;
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
