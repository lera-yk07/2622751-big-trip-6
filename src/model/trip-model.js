import { generateMockData } from '../mock/waypoint.js';

export default class TripModel {
  constructor() {
    const { waypoints, destinations, offersByWaypoint } = generateMockData();
    this._waypoints = waypoints;
    this._destinations = destinations;
    this._offersByWaypoint = offersByWaypoint;
  }

  getWaypoints() {
    return this._waypoints;
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
}