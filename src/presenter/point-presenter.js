import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(container, onDataChange, onModeChange, onDelete, allOffers) {
    this.container = container;
    this.onDataChange = onDataChange;
    this.onModeChange = onModeChange;
    this.onDelete = onDelete;
    this.allOffers = allOffers || [];
    
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
    this.escKeyHandler = null;
    this.waypoint = null;
    this.destination = null;
    this.offers = null;
    this.isSaving = false;
    this._getDestinationCallback = null;
    this._getOffersCallback = null;
  }

  setCallbacks(getDestination, getOffers) {
    this._getDestinationCallback = getDestination;
    this._getOffersCallback = getOffers;
  }

  init(waypoint, destination, offers) {
    this.waypoint = waypoint;
    this.destination = destination || { name: 'Unknown destination', description: '', pictures: [] };
    this.offers = offers || [];
    
    this.pointComponent = new PointView(
      waypoint, 
      this.destination, 
      this.offers,
      () => this.openEditForm()
    );
    
    this.container.appendChild(this.pointComponent.element);
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
  }

  openEditForm() {
    if (this.isEditMode || this.isSaving) return;
    
    if (this.onModeChange) {
      this.onModeChange();
    }
    
    if (this._getDestinationCallback) {
      const freshDestination = this._getDestinationCallback(this.waypoint.destinationId);
      if (freshDestination && freshDestination.name !== 'Unknown destination') {
        this.destination = freshDestination;
      }
    }
    
    this.editFormComponent = new EditFormView(
      this.waypoint, 
      this.destination, 
      this.allOffers,
      async (state) => {
        if (this.isSaving) return;
        
        const updatedWaypoint = {
          ...this.waypoint,
          type: state.type,
          destinationId: state.destinationId,
          dateFrom: state.dateFrom,
          dateTo: state.dateTo,
          basePrice: state.basePrice,
          optionsIds: [...state.selectedOfferIds],
          isFavorite: state.isFavorite
        };
        
        this.isSaving = true;
        this._showSavingState();
        
        try {
          const isNew = !this.waypoint.id;
          let result;
          
          if (isNew) {
            result = await this.onDataChange(updatedWaypoint, 'create');
          } else {
            result = await this.onDataChange(updatedWaypoint, 'update');
          }
          
          if (result && result.success) {
            this.waypoint = result.data || updatedWaypoint;
            this._updatePointComponent();
            this.closeEditForm();
          } else {
            this._showError();
            this._restoreButtonState();
            this.isSaving = false;
          }
        } catch (error) {
          this._showError();
          this._restoreButtonState();
          this.isSaving = false;
        }
      },
      () => {
        this.closeEditForm();
      },
      async () => {
        if (this.isSaving) return;
        
        this.isSaving = true;
        this._showDeletingState();
        
        try {
          const result = await this.onDelete(this.waypoint);
          if (result && result.success) {
            this.destroy();
          } else {
            this._showError();
            this._restoreButtonState();
            this.isSaving = false;
          }
        } catch (error) {
          this._showError();
          this._restoreButtonState();
          this.isSaving = false;
        }
      }
    );
    
    const pointElement = this.pointComponent.element;
    const parent = pointElement.parentElement;
    
    parent.replaceChild(this.editFormComponent.element, pointElement);
    
    this.editFormComponent.setFormSubmitHandler();
    this.editFormComponent.setCancelClickHandler();
    this.editFormComponent.setDeleteClickHandler();
    
    this.escKeyHandler = (evt) => {
      if (evt.key === 'Escape' && !this.isSaving) {
        evt.preventDefault();
        this.closeEditForm();
      }
    };
    document.addEventListener('keydown', this.escKeyHandler);
    
    this.isEditMode = true;
    
    setTimeout(() => {
      this.editFormComponent.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  _showSavingState() {
    const saveBtn = this.editFormComponent?.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
    }
    const deleteBtn = this.editFormComponent?.element.querySelector('.event__delete-btn');
    if (deleteBtn) {
      deleteBtn.disabled = true;
    }
  }

  _showDeletingState() {
    const deleteBtn = this.editFormComponent?.element.querySelector('.event__delete-btn');
    if (deleteBtn) {
      deleteBtn.textContent = 'Deleting...';
      deleteBtn.disabled = true;
    }
    const saveBtn = this.editFormComponent?.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
    }
  }

  _restoreButtonState() {
    if (!this.editFormComponent) return;
    
    const saveBtn = this.editFormComponent.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }
    const deleteBtn = this.editFormComponent.element.querySelector('.event__delete-btn');
    if (deleteBtn) {
      deleteBtn.textContent = 'Delete';
      deleteBtn.disabled = false;
    }
  }

  _showError() {
  // Находим форму
  const formElement = document.querySelector('.event--edit');
  
  if (formElement) {
    // Принудительно добавляем анимацию
    formElement.style.animation = 'shake 0.3s ease-in-out 0s 2';
    formElement.style.backgroundColor = '#ffe0e0';
    
    setTimeout(() => {
      formElement.style.animation = '';
      formElement.style.backgroundColor = '';
    }, 600);
  }
  
  this._restoreButtonState();
}

  _updatePointComponent() {
    if (!this.pointComponent?.element?.parentElement) return;
    
    if (this._getDestinationCallback) {
      const freshDestination = this._getDestinationCallback(this.waypoint.destinationId);
      if (freshDestination && freshDestination.name !== 'Unknown destination') {
        this.destination = freshDestination;
      }
    }
    if (this._getOffersCallback) {
      const freshOffers = this._getOffersCallback(this.waypoint.id);
      if (freshOffers && freshOffers.length) {
        this.offers = freshOffers;
      }
    }
    
    const parent = this.pointComponent.element.parentElement;
    const newPointComponent = new PointView(
      this.waypoint, 
      this.destination, 
      this.offers,
      () => this.openEditForm()
    );
    
    parent.replaceChild(newPointComponent.element, this.pointComponent.element);
    this.pointComponent.removeElement();
    this.pointComponent = newPointComponent;
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
  }

  closeEditForm() {
    if (!this.isEditMode || this.isSaving) return;
    
    const formElement = this.editFormComponent.element;
    const parent = formElement.parentElement;
    
    parent.replaceChild(this.pointComponent.element, formElement);
    
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
      this.escKeyHandler = null;
    }
    
    this.isEditMode = false;
  }

  setFavoriteClickHandler() {
    this.pointComponent.setFavoriteClickHandler(async () => {
      if (this.isSaving) return;
      
      const updatedWaypoint = {
        ...this.waypoint,
        isFavorite: !this.waypoint.isFavorite
      };
      
      this.isSaving = true;
      try {
        const result = await this.onDataChange(updatedWaypoint, 'update');
        if (result && result.success) {
          this.waypoint = result.data || updatedWaypoint;
          this._updatePointComponent();
        }
      } catch (error) {
        console.error('Error updating favorite:', error);
      } finally {
        this.isSaving = false;
      }
    });
  }

  resetView() {
    if (this.isEditMode && !this.isSaving) {
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
