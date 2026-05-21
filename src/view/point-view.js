// src/view/point-view.js

import AbstractView from '../framework/view/abstract-view.js';

const getDuration = (dateFrom, dateTo) => {
  const diff = new Date(dateTo) - new Date(dateFrom);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
};

const getFormattedDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

export default class PointView extends AbstractView {
  constructor(waypoint, destination, offers, onEditClick) {
    super();
    this._waypoint = waypoint;
    this._destination = destination;
    this._offers = offers;
    this._onEditClick = onEditClick;
    
    this._handleEditClick = this._handleEditClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice, isFavorite } = this._waypoint;
    const { name: destinationName } = this._destination;
    
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    const formattedDate = getFormattedDate(dateFrom);
    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = getDuration(dateFrom, dateTo);

    const offersHtml = this._offers.slice(0, 2).map(offer => `
      <li class="event__offer">
        <span class="event__offer-title">${offer.title}</span>
        +€${offer.price}
      </li>
    `).join('');

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${dateFrom}">${formattedDate}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
          </div>
          <div class="event__details">
            <div class="event__topic">
              <h3 class="event__title">${type} to ${destinationName}</h3>
            </div>
            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
                &nbsp;—&nbsp;
                <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
              </p>
              <p class="event__duration">${duration}</p>
            </div>
            <div class="event__price">
              <p class="event__price-value">€ ${basePrice}</p>
            </div>
            <h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">
              ${offersHtml}
            </ul>
          </div>
          <button class="event__favorite-btn ${favoriteClass}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.228 4.326 1.572-9.162L.5 9.674l9.114-1.324L14 .5l4.386 7.85 9.114 1.324-6.844 6.49 1.572 9.162z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event details</span>
          </button>
        </div>
      </li>
    `;
  }

  _handleEditClick(evt) {
  evt.preventDefault();
  if (this._onEditClick) {
    this._onEditClick();
  }
}

  _handleFavoriteClick(evt) {
    evt.preventDefault();
    if (this._onFavoriteClick) {
      this._onFavoriteClick();
    }
  }

  setEditClickHandler() {
  const rollupBtn = this.element.querySelector('.event__rollup-btn');
  console.log('setEditClickHandler called, button found:', rollupBtn);
  if (rollupBtn) {
    rollupBtn.addEventListener('click', this._handleEditClick);
    console.log('Event listener added to rollup button');
  } else {
    console.error('Rollup button not found!');
  }
}

  setFavoriteClickHandler(callback) {
    this._onFavoriteClick = callback;
    const favoriteBtn = this.element.querySelector('.event__favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', this._handleFavoriteClick);
    }
  }
}