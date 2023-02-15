import Cookies from 'js-cookie';

export const CONSENT_DENIED = 'denied';
export const CONSENT_GRANTED = 'granted';
export const CONSENT_PENDING = 'pending';
export const CONSENT_CLOSED = 'closed';

class GDPR {
  constructor() {
    this._consent_analytics = CONSENT_DENIED;
    this._consent_ads = CONSENT_DENIED;
    this._consent_status = CONSENT_PENDING;
    this._consent_user_id = null;

    const consent_analytics = Cookies.get('consent_analytics');
    const consent_ads = Cookies.get('consent_ads');
    const consent_status = Cookies.get('consent_status');
    const consent_user_id = Cookies.get('consent_user_id');

    if( consent_analytics ) this._consent_analytics = this._validateConsent(consent_analytics);
    if( consent_ads ) this._consent_ads = this._validateConsent(consent_ads);
    if( consent_status ) this._consent_status = this._validateStatus(consent_status);
    if( consent_user_id ) this._consent_user_id = this._validateStatus(consent_user_id);

    this._pushDataLayer(false);
  }

  save(consent_analytics, consent_ads) {
    consent_analytics = this._validateConsent(consent_analytics);
    consent_ads = this._validateConsent(consent_ads);

    const hasChanged = consent_analytics !== this._consent_analytics || consent_ads !== this._consent_ads ? true : false;

    this._consent_analytics = consent_analytics;
    this._consent_ads = consent_ads; 
    this._consent_status = CONSENT_CLOSED;

    Cookies.set('consent_analytics', this._consent_analytics);
    Cookies.set('consent_ads', this._consent_ads);
    Cookies.set('consent_status', this._consent_status);

    this._pushDataLayer(hasChanged);
  }

  _pushDataLayer(force = false) {
    const consent_accept = this._consent_analytics === CONSENT_DENIED && this._consent_ads === CONSENT_DENIED ? 0 : 1;

    if( consent_accept || force ) {
      if( !this._consent_user_id ) {
        this._consent_user_id = this._createUserID();
        Cookies.set('consent_user_id', this._consent_user_id);
      }
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_submit', 
        user_id: this._consent_user_id,
        consent_accept,
      });
    }
  }
  _validateConsent(consent) {
    if(consent === CONSENT_GRANTED ) return CONSENT_GRANTED;
    else return CONSENT_DENIED;
  }
  _validateStatus(status) {
    if(status === CONSENT_CLOSED ) return CONSENT_CLOSED;
    else return CONSENT_PENDING;
  }
  _createUserID() {
    const key = self.crypto.getRandomValues(new Uint16Array(1))[0];
    const time = Date.now();

    return `${key}-${time}`;
  }


  // getter - setter
  get consent_analytics() { return this._consent_analytics; }
  get consent_ads() { return this._consent_ads; }
  get consent_status() { return this._consent_status; }
  get consent_user_id() { return this._consent_user_id; }
}

export default new GDPR();
