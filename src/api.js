const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = 'Basic big-trip-user-2024';

export default class Api {
  getPoints() {
    return fetch(`${END_POINT}/points`, {
      headers: { 'Authorization': AUTHORIZATION }
    }).then(r => r.json());
  }

  getDestinations() {
    return fetch(`${END_POINT}/destinations`, {
      headers: { 'Authorization': AUTHORIZATION }
    }).then(r => r.json());
  }

  getOffers() {
    return fetch(`${END_POINT}/offers`, {
      headers: { 'Authorization': AUTHORIZATION }
    }).then(r => r.json());
  }
}
