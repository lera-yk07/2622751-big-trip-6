// src/view/edit-form-view.js

import AbstractView from '../framework/view/abstract-view.js';

export default class EditFormView extends AbstractView {
  constructor(waypoint, destination, offers, onFormSubmit, onCancelClick) {
    super();
    this._waypoint = waypoint;
    this._destination = destination;
    this._offers = offers;
    this._onFormSubmit = onFormSubmit;
    this._onCancelClick = onCancelClick;
    
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice } = this._waypoint;
    const { name: destinationName, description, pictures } = this._destination;
    
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    const startDateValue = startDate.toISOString().slice(0, 16);
    const endDateValue = endDate.toISOString().slice(0, 16);

    const offersHtml = this._offers.map(offer => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" value="${offer.id}" checked>
        <label class="event__offer-label" for="offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€${offer.price}
        </label>
      </div>
    `).join('');

    const photosHtml = pictures.map(picture => `
      <img class="event__photo" src="${picture.src}" alt="${picture.description}">
    `).join('');

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type" for="event-type-toggle-1">
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <select class="event__type-list" id="event-type-toggle-1">
                <option value="${type}" selected>${type}</option>
              </select>
            </div>
            <div class="event__field-group">
              <input class="event__input" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
              <datalist id="destination-list-1">
                <option value="${destinationName}"></option>
              </datalist>
            </div>
            <div class="event__field-group">
              <input class="event__input" type="text" name="event-price" value="${basePrice}">
            </div>
            <div class="event__field-group">
              <input class="event__input" type="datetime-local" name="event-start-time" value="${startDateValue}">
            </div>
            <div class="event__field-group">
              <input class="event__input" type="datetime-local" name="event-end-time" value="${endDateValue}">
            </div>
            <button class="event__save-btn" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>
          <section class="event__details">
            <div class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${offersHtml}
              </div>
            </div>
            <div class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${description}</p>
              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${photosHtml}
                </div>
              </div>
            </div>
          </section>
        </form>
      </li>
    `;
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    this._onFormSubmit();
  }

  _handleCancelClick(evt) {
    evt.preventDefault();
    this._onCancelClick();
  }

  setFormSubmitHandler() {
    this.element.addEventListener('submit', this._handleFormSubmit);
  }

  setCancelClickHandler() {
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
  }
}
