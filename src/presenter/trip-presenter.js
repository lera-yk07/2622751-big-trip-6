import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import PointPresenter from './point-presenter.js';
import { render, RenderPosition } from '../framework/render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.sortComponent = null;
    this.emptyListComponent = null;
    this.loadingComponent = null;
    this.pointPresenters = [];
    this.currentSortType = 'day';
    this.isNewPointMode = false;
    
    this.tripModel.addObserver(() => this.renderTripEvents());
  }

  init() {
    this.renderTripEvents();
    this.initNewEventButton();
  }

  initNewEventButton() {
    const button = document.querySelector('.trip-main__event-add-btn');
    if (button) {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.createNewPoint();
      });
    }
  }

  createNewPoint() {
    if (this.isNewPointMode) return;
    
    this.handleModeChange();
    this.tripModel.setFilter('everything');
    
    const destinations = this.tripModel.getDestinations();
    if (destinations.length === 0) return;
    
    const firstDestination = destinations[0];
    
    const newWaypoint = {
      id: null,
      type: 'flight',
      destinationId: firstDestination.id,
      dateFrom: new Date().toISOString(),
      dateTo: new Date(Date.now() + 3600000).toISOString(),
      basePrice: 100,
      optionsIds: [],
      isFavorite: false
    };
    
    const newDestination = this.tripModel.getDestinationById(newWaypoint.destinationId);
    const offers = [];
    const allOffers = this.tripModel.getAllOffers();
    
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;
    
    const emptyMessage = pointsContainer.querySelector('.trip-events__msg');
    if (emptyMessage) emptyMessage.remove();
    
    const pointPresenter = new PointPresenter(
      pointsContainer,
      async (updatedWaypoint, action) => {
        let result;
        if (action === 'create') {
          result = await this.tripModel.createWaypoint(updatedWaypoint);
          if (result.success) {
            this.isNewPointMode = false;
            this.renderTripEvents();
          }
        } else {
          result = await this.tripModel.updateWaypoint(updatedWaypoint);
        }
        return result;
      },
      () => this.handleModeChange(),
      async (waypoint) => {
        const result = await this.tripModel.deleteWaypoint(waypoint.id);
        if (result.success) {
          this.isNewPointMode = false;
          this.renderTripEvents();
        }
        return result;
      },
      allOffers
    );
    
    pointPresenter.setCallbacks(
      (id) => this.tripModel.getDestinationById(id),
      (id) => this.tripModel.getOffersForWaypoint(id)
    );
    
    pointPresenter.init(newWaypoint, newDestination, offers);
    pointPresenter.openEditForm();
    
    this.pointPresenters.push(pointPresenter);
    this.isNewPointMode = true;
  }

  renderSort() {
    this.sortComponent = new SortView(this.currentSortType, (sortType) => {
      if (this.currentSortType === sortType) return;
      this.currentSortType = sortType;
      this.tripModel.setSort(sortType);
    });

    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      const oldSort = sortContainer.querySelector('.trip-events__sort');
      if (oldSort) {
        oldSort.remove();
      }
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
      this.sortComponent.setSortChangeHandler();
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    this.pointPresenters.forEach(presenter => {
      if (presenter.destroy) presenter.destroy();
    });
    this.pointPresenters = [];

    const sortElement = pointsContainer.querySelector('.trip-events__sort');
    pointsContainer.innerHTML = '';
    if (sortElement) {
      pointsContainer.appendChild(sortElement);
    }

    if (this.tripModel.isLoading()) {
      this.renderLoading(pointsContainer);
      return;
    }

    const waypoints = this.tripModel.getWaypoints();
    const activeFilter = this.tripModel.getActiveFilter();
    const filter = this.tripModel.getFilters().find(f => f.type === activeFilter);
    const emptyMessage = filter ? filter.emptyMessage : 'Click New Event to create your first point';

    if (waypoints.length === 0 && !this.isNewPointMode) {
      this.renderEmptyList(pointsContainer, emptyMessage);
      return;
    }

    if (waypoints.length > 0 && !pointsContainer.querySelector('.trip-events__sort')) {
      this.renderSort();
    }

    waypoints.forEach((waypoint) => {
      this.renderPoint(waypoint, pointsContainer);
    });
  }

  renderLoading(container) {
    this.loadingComponent = new LoadingView();
    render(this.loadingComponent, container);
  }

  renderEmptyList(container, message) {
    this.emptyListComponent = new EmptyListView(message);
    render(this.emptyListComponent, container);
  }

  renderPoint(waypoint, container) {
    const destination = this.tripModel.getDestinationById(waypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(waypoint.id);
    const allOffers = this.tripModel.getAllOffers();
    
    const pointPresenter = new PointPresenter(
      container,
      async (updatedWaypoint) => {
        const result = await this.tripModel.updateWaypoint(updatedWaypoint);
        return result;
      },
      () => this.handleModeChange(),
      async (waypoint) => {
        const result = await this.tripModel.deleteWaypoint(waypoint.id);
        if (result.success) {
          this.renderTripEvents();
        }
        return result;
      },
      allOffers
    );
    
    pointPresenter.setCallbacks(
      (id) => this.tripModel.getDestinationById(id),
      (id) => this.tripModel.getOffersForWaypoint(id)
    );
    
    pointPresenter.init(waypoint, destination, offers);
    this.pointPresenters.push(pointPresenter);
  }

  handleModeChange() {
    this.pointPresenters.forEach(presenter => {
      if (presenter && typeof presenter.resetView === 'function') {
        presenter.resetView();
      }
    });
    this.isNewPointMode = false;
  }
}
