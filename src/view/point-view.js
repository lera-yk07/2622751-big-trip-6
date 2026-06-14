import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

const DEFAULT_DESTINATION = {
  name: 'Unknown destination',
  description: 'No description available',
  pictures: []
};

const getDuration = (dateFrom, dateTo) => {
  const diff = dayjs(dateTo).diff(dayjs(dateFrom));
  const dur = dayjs.duration(diff);
  
  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const minutes = dur.minutes();
  
  if (days > 0) {
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes.toString().padStart(2, '0')}m`;
};

const getFormattedDate = (date) => {
  return dayjs(date).format('MMM D').toUpperCase();
};

const getFormattedTime = (date) => {
  return dayjs(date).format('HH:mm');
};

export default class PointView extends AbstractView {
  constructor(waypoint, destination, offers, onEditClick) {
    super();
    this._waypoint = waypoint;
    
    if (!destination || typeof destination !== 'object') {
      this._destination = { ...DEFAULT_DESTINATION };
    } else {
      this._destination = {
        name: destination.name || DEFAULT_DESTINATION.name,
        description: destination.description || DEFAULT_DESTINATION.description,
        pictures: Array.isArray(destination.pictures) ? destination.pictures : DEFAULT_DESTINATION.pictures
      };
    }
    
    this._offers = offers || [];
    this._onEditClick = onEditClick;
    
    this._handleEditClick = this._handleEditClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  get template() {
    let destination = this._destination;
    if (!destination || typeof destination !== 'object') {
      destination = { ...DEFAULT_DESTINATION };
    }
    
    const { type, dateFrom, dateTo, basePrice, isFavorite } = this._waypoint;
    const destinationName = destination.name || DEFAULT_DESTINATION.name;
    
    const formattedDate = getFormattedDate(dateFrom);
    const startTime = getFormattedTime(dateFrom);
    const endTime = getFormattedTime(dateTo);
    const durationTime = getDuration(dateFrom, dateTo);

    const offersHtml = this._offers.slice(0, 3).map(offer => `
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
          
          <div class="event__title">${type} to ${this._escapeHtml(destinationName)}</div>
          
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
              &nbsp;—&nbsp;
              <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
            </p>
            <p class="event__duration">${durationTime}</p>
          </div>
          
          <div class="event__price">
            € ${basePrice}
          </div>
          
          <ul class="event__selected-offers">
            ${offersHtml}
          </ul>
          
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

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this._handleEditClick);
    }
  }

  setFavoriteClickHandler(callback) {
    this._onFavoriteClick = callback;
    const favoriteBtn = this.element.querySelector('.event__favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.removeEventListener('click', this._handleFavoriteClick);
      favoriteBtn.addEventListener('click', this._handleFavoriteClick);
    }
  }
}
