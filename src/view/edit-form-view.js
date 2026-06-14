import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const WaypointType = {
  TAXI: 'taxi',
  BUS: 'bus',
  TRAIN: 'train',
  SHIP: 'ship',
  DRIVE: 'drive',
  FLIGHT: 'flight',
  CHECK_IN: 'check-in',
  SIGHTSEEING: 'sightseeing',
  RESTAURANT: 'restaurant'
};

const MAX_PRICE = 100000;

export default class EditFormView extends AbstractStatefulView {
  constructor(waypoint, destination, allOffers, onFormSubmit, onCancelClick, onDeleteClick) {
    super();
    this._waypoint = waypoint;
    this._destination = destination || { name: 'Unknown destination', description: '', pictures: [] };
    this._allOffers = allOffers || [];
    this._onFormSubmit = onFormSubmit;
    this._onCancelClick = onCancelClick;
    this._onDeleteClick = onDeleteClick;
    this._datepickerFrom = null;
    this._datepickerTo = null;
    
    const validInitialOffers = (waypoint.optionsIds || []).filter(offerId => {
      const offer = this._allOffers.find(o => o.id === offerId);
      return offer && offer.type === waypoint.type;
    });
    
    this._setState({
      type: waypoint.type,
      destinationId: waypoint.destinationId,
      dateFrom: waypoint.dateFrom,
      dateTo: waypoint.dateTo,
      basePrice: waypoint.basePrice,
      selectedOfferIds: validInitialOffers,
      isFavorite: waypoint.isFavorite
    });
    
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleOfferChange = this._handleOfferChange.bind(this);
    this._handlePriceChange = this._handlePriceChange.bind(this);
    this._handleDestinationChange = this._handleDestinationChange.bind(this);
    this._handleDateFromChange = this._handleDateFromChange.bind(this);
    this._handleDateToChange = this._handleDateToChange.bind(this);
  }

  get template() {
    if (!this._destination) {
      this._destination = { name: 'Unknown destination', description: '', pictures: [] };
    }
    
    const { type, dateFrom, dateTo, basePrice, selectedOfferIds } = this._state;
    const destinationName = this._destination.name || 'Unknown destination';
    const description = this._destination.description || '';
    const pictures = this._destination.pictures || [];
    
    const startDate = dateFrom ? dayjs(dateFrom).format('YYYY-MM-DDTHH:mm') : '';
    const endDate = dateTo ? dayjs(dateTo).format('YYYY-MM-DDTHH:mm') : '';
    
    const isDateValid = dateFrom && dateTo && new Date(dateFrom) <= new Date(dateTo);
    const isPriceValid = basePrice >= 1 && basePrice <= MAX_PRICE;
    
    const filteredOffers = this._allOffers.filter(offer => offer.type === type);
    
    const offersHtml = filteredOffers.map(offer => `
      <div class="event__offer-selector">
        <input 
          class="event__offer-checkbox visually-hidden" 
          id="offer-${offer.id}" 
          type="checkbox" 
          name="offer" 
          value="${offer.id}"
          ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}
        >
        <label class="event__offer-label" for="offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€${offer.price}
        </label>
      </div>
    `).join('');

    const photosHtml = pictures && pictures.length > 0 
      ? pictures.map(picture => `
          <img class="event__photo" src="${picture.src}" alt="${picture.description || ''}">
        `).join('')
      : '<p>No photos available</p>';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type" for="event-type-toggle-1">
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <select class="event__type-list" id="event-type-toggle-1" data-type-select>
                ${Object.values(WaypointType).map(typeOption => `
                  <option value="${typeOption}" ${type === typeOption ? 'selected' : ''}>${typeOption}</option>
                `).join('')}
              </select>
            </div>
            <div class="event__field-group">
              <input 
                class="event__input" 
                type="text" 
                name="event-destination" 
                value="${destinationName}" 
                list="destination-list-1"
                data-destination-input
                readonly
              >
              <datalist id="destination-list-1">
                <option value="${destinationName}"></option>
              </datalist>
            </div>
            <div class="event__field-group">
              <input 
                class="event__input ${!isPriceValid ? 'event__input--error' : ''}" 
                type="number" 
                name="event-price" 
                value="${basePrice}"
                data-price-input
                min="1"
                step="1"
              >
            </div>
            <div class="event__field-group">
              <input 
                class="event__input ${!isDateValid ? 'event__input--error' : ''}" 
                type="datetime-local" 
                name="event-start-time" 
                value="${startDate}"
                data-start-date
              >
            </div>
            <div class="event__field-group">
              <input 
                class="event__input ${!isDateValid ? 'event__input--error' : ''}" 
                type="datetime-local" 
                name="event-end-time" 
                value="${endDate}"
                data-end-date
              >
            </div>
            <button class="event__save-btn" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
            <button class="event__delete-btn" type="button">Delete</button>
          </header>
          <section class="event__details">
            <div class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers" data-offers-container>
                ${offersHtml || '<p>No offers available</p>'}
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

  _getFormData() {
    const typeSelect = this.element.querySelector('.event__type-list');
    const priceInput = this.element.querySelector('[data-price-input]');
    const startDateInput = this.element.querySelector('[data-start-date]');
    const endDateInput = this.element.querySelector('[data-end-date]');
    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox:checked');
    
    const currentType = typeSelect ? typeSelect.value : this._state.type;
    
    let price = priceInput ? (parseInt(priceInput.value, 10) || 1) : this._state.basePrice;
    if (price < 1) {
      price = 1;
    }
    
    const selectedOfferIds = Array.from(offerCheckboxes).map(cb => cb.value);
    
    return {
      type: currentType,
      destinationId: this._state.destinationId,
      dateFrom: startDateInput && startDateInput.value ? new Date(startDateInput.value).toISOString() : this._state.dateFrom,
      dateTo: endDateInput && endDateInput.value ? new Date(endDateInput.value).toISOString() : this._state.dateTo,
      basePrice: price,
      selectedOfferIds: selectedOfferIds,
      isFavorite: this._state.isFavorite
    };
  }

 _handleFormSubmit(evt) {
  evt.preventDefault();
  
  const priceInput = this.element.querySelector('[data-price-input]');
  const rawPrice = parseInt(priceInput.value, 10);
  
  if (rawPrice > MAX_PRICE) {
    const form = this.element.querySelector('form');
    if (form) {
      form.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        form.style.animation = '';
      }, 500);
    }
    return;
  }
  
  const formData = this._getFormData();
  this._onFormSubmit(formData);
}

  _handleCancelClick(evt) {
    evt.preventDefault();
    this._onCancelClick();
  }

  _handleDeleteClick(evt) {
    evt.preventDefault();
    if (this._onDeleteClick) {
      this._onDeleteClick();
    }
  }

  _handleTypeChange(evt) {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      selectedOfferIds: []
    });
  }

  _handleDestinationChange(evt) {
    this.updateElement({
      destinationId: evt.target.value
    });
  }

  _handleOfferChange(evt) {
    const offerId = evt.target.value;
    let selectedOfferIds = [...this._state.selectedOfferIds];
    
    if (evt.target.checked) {
      if (!selectedOfferIds.includes(offerId)) {
        selectedOfferIds.push(offerId);
      }
    } else {
      selectedOfferIds = selectedOfferIds.filter(id => id !== offerId);
    }
    
    this.updateElement({ selectedOfferIds });
  }

  _handlePriceChange(evt) {
    let value = parseInt(evt.target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    if (value < 1) {
      value = 1;
    }
    // НЕ ограничиваем цену, просто обновляем состояние
    this.updateElement({
      basePrice: value
    });
  }

  _handleDateFromChange(evt) {
    this.updateElement({
      dateFrom: new Date(evt.target.value).toISOString()
    });
  }

  _handleDateToChange(evt) {
    this.updateElement({
      dateTo: new Date(evt.target.value).toISOString()
    });
  }

  _initDatepickers() {
    const startDateInput = this.element.querySelector('[data-start-date]');
    const endDateInput = this.element.querySelector('[data-end-date]');
    
    if (startDateInput && !this._datepickerFrom) {
      this._datepickerFrom = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateElement({ dateFrom: selectedDates[0].toISOString() });
          }
        }
      });
    }
    
    if (endDateInput && !this._datepickerTo) {
      this._datepickerTo = flatpickr(endDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateElement({ dateTo: selectedDates[0].toISOString() });
          }
        }
      });
    }
  }

  _destroyDatepickers() {
    if (this._datepickerFrom) {
      this._datepickerFrom.destroy();
      this._datepickerFrom = null;
    }
    if (this._datepickerTo) {
      this._datepickerTo.destroy();
      this._datepickerTo = null;
    }
  }

  _restoreHandlers() {
    const form = this.element.querySelector('form');
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    const deleteBtn = this.element.querySelector('.event__delete-btn');
    const typeSelect = this.element.querySelector('.event__type-list');
    const destinationInput = this.element.querySelector('[data-destination-input]');
    const priceInput = this.element.querySelector('[data-price-input]');
    const startDateInput = this.element.querySelector('[data-start-date]');
    const endDateInput = this.element.querySelector('[data-end-date]');
    const offersContainer = this.element.querySelector('[data-offers-container]');
    
    if (form) {
      form.removeEventListener('submit', this._handleFormSubmit);
      form.addEventListener('submit', this._handleFormSubmit);
    }
    if (cancelBtn) {
      cancelBtn.removeEventListener('click', this._handleCancelClick);
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', this._handleDeleteClick);
      deleteBtn.addEventListener('click', this._handleDeleteClick);
    }
    if (typeSelect) {
      typeSelect.removeEventListener('change', this._handleTypeChange);
      typeSelect.addEventListener('change', this._handleTypeChange);
    }
    if (destinationInput) {
      destinationInput.removeEventListener('change', this._handleDestinationChange);
      destinationInput.addEventListener('change', this._handleDestinationChange);
    }
    if (priceInput) {
      priceInput.removeEventListener('change', this._handlePriceChange);
      priceInput.addEventListener('change', this._handlePriceChange);
    }
    if (startDateInput) {
      startDateInput.removeEventListener('change', this._handleDateFromChange);
      startDateInput.addEventListener('change', this._handleDateFromChange);
    }
    if (endDateInput) {
      endDateInput.removeEventListener('change', this._handleDateToChange);
      endDateInput.addEventListener('change', this._handleDateToChange);
    }
    
    if (offersContainer) {
      const checkboxes = offersContainer.querySelectorAll('.event__offer-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', this._handleOfferChange);
        checkbox.addEventListener('change', this._handleOfferChange);
      });
    }
    
    this._initDatepickers();
  }

  setFormSubmitHandler() {
    const form = this.element.querySelector('form');
    if (form) {
      form.removeEventListener('submit', this._handleFormSubmit);
      form.addEventListener('submit', this._handleFormSubmit);
    }
  }

  setCancelClickHandler() {
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.removeEventListener('click', this._handleCancelClick);
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
  }

  setDeleteClickHandler() {
    const deleteBtn = this.element.querySelector('.event__delete-btn');
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', this._handleDeleteClick);
      deleteBtn.addEventListener('click', this._handleDeleteClick);
    }
  }

  updateElement(update) {
    super.updateElement(update);
    this._restoreHandlers();
  }

  removeElement() {
    this._destroyDatepickers();
    super.removeElement();
  }
}
