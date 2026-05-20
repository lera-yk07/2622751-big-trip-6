import AbstractView from '../framework/view/abstract-view.js';

export default class SortView extends AbstractView {
  constructor(sortItems, onSortChange) {
    super();
    this._sortItems = sortItems;
    this._onSortChange = onSortChange;
    this._handleSortChange = this._handleSortChange.bind(this);
  }

  get template() {
    return `
      <form class="trip-events__trip-sort trip-sort" action="#" method="get">
        ${this._sortItems.map(item => `
          <div class="trip-sort__item trip-sort__item--${item.type}">
            <input 
              id="sort-${item.type}" 
              class="trip-sort__input visually-hidden" 
              type="radio" 
              name="trip-sort" 
              value="${item.type}"
              ${item.isActive ? 'checked' : ''}
              ${item.isDisabled ? 'disabled' : ''}
            >
            <label class="trip-sort__btn" for="sort-${item.type}">${item.name}</label>
          </div>
        `).join('')}
      </form>
    `;
  }

  _handleSortChange(evt) {
    if (evt.target.classList.contains('trip-sort__input')) {
      this._onSortChange(evt.target.value);
    }
  }

  setSortChangeHandler() {
    this.element.addEventListener('change', this._handleSortChange);
  }
}