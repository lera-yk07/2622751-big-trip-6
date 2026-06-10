import TripModel from './model/trip-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FiltersPresenter from './presenter/filters-presenter.js';
import Api from './api.js';

const tripEventsSection = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');

const USE_MOCKS = false;

let tripModel;
let filtersPresenter;
let tripPresenter;

if (USE_MOCKS) {
  tripModel = new TripModel();
  filtersPresenter = new FiltersPresenter(filtersContainer, tripModel);
  filtersPresenter.init();
  tripPresenter = new TripPresenter(tripEventsSection, tripModel);
  tripPresenter.init();
} else {
  const api = new Api();
  tripModel = new TripModel(api);
  
  filtersPresenter = new FiltersPresenter(filtersContainer, tripModel);
  tripPresenter = new TripPresenter(tripEventsSection, tripModel);
  
  tripModel.init().then(() => {
    filtersPresenter.init();
    tripPresenter.init();
  });
}
