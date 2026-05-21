// src/presenter/trip-presenter.js

import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import PointPresenter from './point-presenter.js';
import { render, RenderPosition } from '../framework/render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.emptyListComponent = null;
    this.pointPresenters = [];
    this.currentSortComponent = null;
  }

  init() {
    this.renderFilters();
    this.renderTripEvents();
  }

  renderFilters() {
    const filters = this.tripModel.getFilters();
    this.filtersComponent = new FiltersView(filters, (filterType) => {
      this.tripModel.setFilter(filterType);
      this.renderTripEvents();
    });

    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '';
      render(this.filtersComponent, filtersContainer);
    }
    this.filtersComponent.setFilterChangeHandler();
  }

  renderSort() {
    const sortItems = this.tripModel.getSort();
    this.sortComponent = new SortView(sortItems, (sortType) => {
      this.tripModel.setSort(sortType);
      this.renderTripEvents();
    });

    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      if (this.currentSortComponent) {
        this.currentSortComponent.element.remove();
      }
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
      this.currentSortComponent = this.sortComponent;
      this.sortComponent.setSortChangeHandler();
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    const waypoints = this.tripModel.getWaypoints();

    // Уничтожаем старые презентеры
    this.pointPresenters.forEach(presenter => {
      if (presenter.destroy) {
        presenter.destroy();
      }
    });
    this.pointPresenters = [];

    // Очищаем контейнер
    pointsContainer.innerHTML = '';

    if (waypoints.length === 0) {
      this.renderEmptyList(pointsContainer);
      return;
    }

    // Отрисовываем сортировку
    this.renderSort();

    // Создаём новые презентеры для каждой точки
    waypoints.forEach((waypoint) => {
      this.renderPoint(waypoint, pointsContainer);
    });
  }

  renderEmptyList(container) {
    this.emptyListComponent = new EmptyListView();
    render(this.emptyListComponent, container);
  }

  renderPoint(waypoint, container) {
    const destination = this.tripModel.getDestinationById(waypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(waypoint.id);
    
    const pointPresenter = new PointPresenter(
      container,
      this.handleWaypointChange.bind(this),
      () => this.handleModeChange()
    );
    
    pointPresenter.init(waypoint, destination, offers);
    this.pointPresenters.push(pointPresenter);
  }

  handleWaypointChange(updatedWaypoint) {
  // Обновляем данные в модели
  const waypoints = this.tripModel.getWaypoints();
  const index = waypoints.findIndex(waypoint => waypoint.id === updatedWaypoint.id);
  
  if (index !== -1) {
    waypoints[index] = updatedWaypoint;
  }
  
  // Находим презентер для обновлённой точки и обновляем его
  const pointPresenter = this.pointPresenters[index];
  if (pointPresenter) {
    const destination = this.tripModel.getDestinationById(updatedWaypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(updatedWaypoint.id);
    
    // Обновляем презентер с новыми данными
    pointPresenter.update(updatedWaypoint, destination, offers);
  }
}

  handleModeChange() {
    // Закрываем все открытые формы
    this.pointPresenters.forEach(presenter => {
      if (presenter && typeof presenter.resetView === 'function') {
        presenter.resetView();
      }
    });
  }
}