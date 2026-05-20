import AbstractView from '../framework/view/abstract-view.js';

export default class FiltersView extends AbstractView {
  constructor(filters, onFilterChange) {
    super();
    this._filters = filters;
    this._onFilterChange = onFilterChange;
    this._handleFilterChange = this._handleFilterChange.bind(this);
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this._filters.map(filter => `
          <div class="trip-filters__filter">
            <input 
              id="filter-${filter.type}" 
              class="trip-filters__filter-input visually-hidden" 
              type="radio" 
              name="trip-filter" 
              value="${filter.type}"
              ${filter.isActive ? 'checked' : ''}
              ${filter.isDisabled ? 'disabled' : ''}
            >
            <label class="trip-filters__filter-label" for="filter-${filter.type}">
              ${filter.name} <span class="visually-hidden">filter</span>
            </label>
          </div>
        `).join('')}
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  _handleFilterChange(evt) {
    if (evt.target.classList.contains('trip-filters__filter-input')) {
      this._onFilterChange(evt.target.value);
    }
  }

  setFilterChangeHandler() {
    this.element.addEventListener('change', this._handleFilterChange);
  }
}