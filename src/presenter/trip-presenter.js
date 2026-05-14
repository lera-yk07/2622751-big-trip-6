import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, RenderPosition } from '../render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.pointComponents = [];
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderTripEvents();
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '';
      render(this.filtersComponent, filtersContainer);
    }
  }

  renderSort() {
    this.sortComponent = new SortView();
    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    // Очищаем контейнер, но оставляем сортировку
    const sortElement = this.sortComponent?.getElement();
    pointsContainer.innerHTML = '';
    if (sortElement) {
      pointsContainer.appendChild(sortElement);
    }

    const waypoints = this.tripModel.getWaypoints();
    
    if (waypoints.length === 0) return;

    // Отрисовываем форму редактирования первой (на основе первой точки)
    const firstWaypoint = waypoints[0];
    const firstDestination = this.tripModel.getDestinationById(firstWaypoint.destinationId);
    const firstOffers = this.tripModel.getOffersForWaypoint(firstWaypoint.id);
    
    const editForm = new EditFormView(firstWaypoint, firstDestination, firstOffers);
    render(editForm, pointsContainer);

    // Отрисовываем 3 точки маршрута
    const waypointsToShow = waypoints.slice(0, 3);
    waypointsToShow.forEach((waypoint) => {
      const destination = this.tripModel.getDestinationById(waypoint.destinationId);
      const offers = this.tripModel.getOffersForWaypoint(waypoint.id);
      const pointView = new PointView(waypoint, destination, offers);
      render(pointView, pointsContainer);
      this.pointComponents.push(pointView);
    });
  }
}