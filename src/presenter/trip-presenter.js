import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import EmptyListView from '../view/empty-list-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.emptyListComponent = null;
    this.pointComponents = new Map();
    this.currentEditForm = null;
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
    if (sortContainer && this.sortComponent) {
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
      this.sortComponent.setSortChangeHandler();
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    // Очищаем контейнер
    pointsContainer.innerHTML = '';

    const waypoints = this.tripModel.getWaypoints();
    
    // Если нет точек маршрута, показываем сообщение
    if (waypoints.length === 0) {
      this.renderEmptyList(pointsContainer);
      return;
    }

    // Отрисовываем сортировку
    this.renderSort();

    // Отрисовываем все точки маршрута
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
    
    const pointComponent = new PointView(
      waypoint, 
      destination, 
      offers,
      () => this.replacePointToEditForm(waypoint, destination, offers, pointComponent, container)
    );
    
    render(pointComponent, container);
    pointComponent.setEditClickHandler();
    this.pointComponents.set(waypoint.id, pointComponent);
  }

  replacePointToEditForm(waypoint, destination, offers, pointComponent, container) {
    if (this.currentEditForm) {
      this.closeEditForm();
    }

    const editForm = new EditFormView(
      waypoint,
      destination,
      offers,
      () => this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container),
      () => this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container)
    );

    replace(editForm, pointComponent);
    this.currentEditForm = editForm;
    
    editForm.setFormSubmitHandler();
    editForm.setCancelClickHandler();
    
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this, editForm, pointComponent, waypoint, destination, offers, container);
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container) {
    if (!editForm || !pointComponent) return;
    
    replace(pointComponent, editForm);
    this.currentEditForm = null;
    
    if (this._handleEscKeyDown) {
      document.removeEventListener('keydown', this._handleEscKeyDown);
    }
  }

  closeEditForm() {
    if (this.currentEditForm) {
      this.currentEditForm.element.remove();
      this.currentEditForm = null;
      if (this._handleEscKeyDown) {
        document.removeEventListener('keydown', this._handleEscKeyDown);
      }
    }
  }

  _handleEscKeyDown(editForm, pointComponent, waypoint, destination, offers, container, evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container);
    }
  }
}