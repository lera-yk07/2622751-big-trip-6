import TripModel from './model/trip-model.js';
import TripPresenter from './presenter/trip-presenter.js';

const tripEventsSection = document.querySelector('.trip-events');

const tripModel = new TripModel();
const tripPresenter = new TripPresenter(tripEventsSection, tripModel);
tripPresenter.init();