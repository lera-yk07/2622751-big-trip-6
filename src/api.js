const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = 'Basic big-trip-user-2024';

export default class Api {
  _load({ url, method = 'GET', body = null }) {
    const options = {
      method,
      headers: {
        'Authorization': AUTHORIZATION,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(`${END_POINT}/${url}`, options)
      .then(response => {
        if (!response.ok) {
          // АНИМАЦИЯ ПРИ ОШИБКЕ ОТ СЕРВЕРА
          const form = document.querySelector('.event--edit');
          if (form) {
            form.style.animation = 'shake 0.5s ease-in-out';
            form.style.backgroundColor = '#ffcccc';
            setTimeout(() => {
              form.style.animation = '';
              form.style.backgroundColor = '';
            }, 500);
          }
          
          return response.json().then(err => {
            throw new Error(`${response.status}: ${JSON.stringify(err)}`);
          });
        }
        if (method === 'DELETE') {
          return null;
        }
        return response.json();
      })
      .catch(error => {
        // АНИМАЦИЯ ПРИ ЛЮБОЙ ОШИБКЕ
        const form = document.querySelector('.event--edit');
        if (form) {
          form.style.animation = 'shake 0.5s ease-in-out';
          form.style.backgroundColor = '#ffcccc';
          setTimeout(() => {
            form.style.animation = '';
            form.style.backgroundColor = '';
          }, 500);
        }
        throw error;
      });
  }

  _adaptToClient(point) {
    return {
      id: point.id,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      destinationId: point.destination,
      isFavorite: point.is_favorite,
      optionsIds: point.offers || [],
      type: point.type
    };
  }

  _adaptToServer(point) {
    const formatDate = (dateString) => {
      if (!dateString) return dateString;
      return dateString.replace(/\.\d{3}Z$/, 'Z');
    };
    
    const offers = point.optionsIds ? point.optionsIds.map(id => String(id)) : [];
    
    return {
      'base_price': Number(point.basePrice),
      'date_from': formatDate(point.dateFrom),
      'date_to': formatDate(point.dateTo),
      'destination': point.destinationId,
      'is_favorite': Boolean(point.isFavorite),
      'offers': offers,
      'type': point.type
    };
  }

  getPoints() {
    return this._load({ url: 'points' })
      .then(points => points.map(point => this._adaptToClient(point)));
  }

  getDestinations() {
    return this._load({ url: 'destinations' });
  }

  getOffers() {
    return this._load({ url: 'offers' });
  }

  updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: this._adaptToServer(point)
    }).then(response => response ? this._adaptToClient(response) : null);
  }

  createPoint(point) {
    return this._load({
      url: 'points',
      method: 'POST',
      body: this._adaptToServer(point)
    }).then(response => this._adaptToClient(response));
  }

  deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: 'DELETE'
    });
  }
}
