import TripModel from './model/trip-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FiltersPresenter from './presenter/filters-presenter.js';
import Api from './api.js';

const tripEventsSection = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');

const api = new Api();
const tripModel = new TripModel(api);

window.tripModel = tripModel;

const filtersPresenter = new FiltersPresenter(filtersContainer, tripModel);
const tripPresenter = new TripPresenter(tripEventsSection, tripModel);

tripModel.init().then(() => {
  filtersPresenter.init();
  tripPresenter.init();
  console.log('App initialized with', tripModel._waypoints.length, 'points');
  console.log('All offers count:', tripModel._allOffers.length);
}).catch(error => {
  console.error('Failed to load data:', error);
});
