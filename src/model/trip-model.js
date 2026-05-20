import { generateMockData } from '../mock/waypoint.js';
import { generateFilters } from '../mock/filter.js';
import { generateSort } from '../mock/sort.js';

export default class TripModel {
  constructor() {
    const { waypoints, destinations, offersByWaypoint } = generateMockData();
    this._waypoints = waypoints;
    this._destinations = destinations;
    this._offersByWaypoint = offersByWaypoint;
    this._activeFilter = 'everything';
    this._activeSort = 'day';
    this._updateFiltersAndSort();
  }

  _updateFiltersAndSort() {
    this._filters = generateFilters(this._waypoints);
    this._sort = generateSort();
  }

  getWaypoints() {
    let filteredWaypoints = [...this._waypoints];
    
    // Применяем фильтр
    const now = new Date();
    switch (this._activeFilter) {
      case 'future':
        filteredWaypoints = filteredWaypoints.filter(waypoint => new Date(waypoint.dateFrom) > now);
        break;
      case 'past':
        filteredWaypoints = filteredWaypoints.filter(waypoint => new Date(waypoint.dateTo) < now);
        break;
    }
    
    // Применяем сортировку
    switch (this._activeSort) {
      case 'day':
        filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
      case 'price':
        filteredWaypoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
    }
    
    return filteredWaypoints;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffersForWaypoint(waypointId) {
    return this._offersByWaypoint[waypointId] || [];
  }

  getDestinationById(id) {
    return this._destinations.find(dest => dest.id === id);
  }

  getFilters() {
    return generateFilters(this._waypoints);
  }

  getSort() {
    return generateSort();
  }

  setFilter(filterType) {
    this._activeFilter = filterType;
    this._updateFiltersAndSort();
  }

  setSort(sortType) {
    this._activeSort = sortType;
    this._updateFiltersAndSort();
  }

  getActiveFilter() {
    return this._activeFilter;
  }

  getActiveSort() {
    return this._activeSort;
  }
}