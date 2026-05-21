import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(container, onDataChange, onModeChange) {
    this.container = container;
    this.onDataChange = onDataChange;
    this.onModeChange = onModeChange;
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
    this.escKeyHandler = null;
    this.waypoint = null;
    this.destination = null;
    this.offers = null;
  }

  init(waypoint, destination, offers) {
    this.waypoint = waypoint;
    this.destination = destination;
    this.offers = offers;
    
    this.pointComponent = new PointView(
      waypoint, destination, offers,
      () => this.openEditForm()
    );
    
    this.editFormComponent = new EditFormView(
      waypoint, destination, offers,
      () => this.closeEditForm(),
      () => this.closeEditForm()
    );
    
    this.container.appendChild(this.pointComponent.element);
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
  }

  update(waypoint, destination, offers) {
    this.waypoint = waypoint;
    this.destination = destination;
    this.offers = offers;
    
    // Сохраняем позицию текущего элемента
    const oldElement = this.pointComponent.element;
    const parent = oldElement.parentElement;
    const nextSibling = oldElement.nextSibling;
    
    // Создаём новый компонент точки
    const newPointComponent = new PointView(
      waypoint, destination, offers,
      () => this.openEditForm()
    );
    
    // Заменяем элемент
    if (parent) {
      parent.insertBefore(newPointComponent.element, nextSibling);
      oldElement.remove();
    }
    
    this.pointComponent = newPointComponent;
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
    
    // Обновляем форму редактирования
    this.editFormComponent = new EditFormView(
      waypoint, destination, offers,
      () => this.closeEditForm(),
      () => this.closeEditForm()
    );
    
    if (this.isEditMode) {
      this.closeEditForm();
    }
  }

  openEditForm() {
    if (this.isEditMode) return;
    
    if (this.onModeChange) {
      this.onModeChange();
    }
    
    const pointElement = this.pointComponent.element;
    if (!pointElement || !pointElement.isConnected) return;
    
    const parent = pointElement.parentElement;
    if (!parent) return;
    
    parent.replaceChild(this.editFormComponent.element, pointElement);
    
    this.editFormComponent.setFormSubmitHandler();
    this.editFormComponent.setCancelClickHandler();
    
    this.escKeyHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.closeEditForm();
      }
    };
    document.addEventListener('keydown', this.escKeyHandler);
    
    this.isEditMode = true;
  }

  closeEditForm() {
    if (!this.isEditMode) return;
    
    const formElement = this.editFormComponent.element;
    if (!formElement || !formElement.isConnected) {
      this.isEditMode = false;
      return;
    }
    
    const parent = formElement.parentElement;
    if (!parent) {
      this.isEditMode = false;
      return;
    }
    
    parent.replaceChild(this.pointComponent.element, formElement);
    
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
      this.escKeyHandler = null;
    }
    
    this.isEditMode = false;
  }

  setFavoriteClickHandler() {
    this.pointComponent.setFavoriteClickHandler(() => {
      const updatedWaypoint = {
        ...this.waypoint,
        isFavorite: !this.waypoint.isFavorite
      };
      this.waypoint = updatedWaypoint;
      if (this.onDataChange) {
        this.onDataChange(updatedWaypoint);
      }
    });
  }

  resetView() {
    if (this.isEditMode) {
      this.closeEditForm();
    }
  }

  destroy() {
    if (this.pointComponent && this.pointComponent.element) {
      this.pointComponent.element.remove();
    }
    if (this.editFormComponent && this.editFormComponent.element) {
      this.editFormComponent.element.remove();
    }
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
    }
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
  }
}