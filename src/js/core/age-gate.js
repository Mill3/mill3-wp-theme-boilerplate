class AgeGate {
  constructor() {
    this._locked = localStorage.getItem('ageGate') != 1;
  }

  unlock() {
    localStorage.setItem('ageGate', 1);
    this._locked = false;
  }


  // getter
  get locked() { return this._locked; }
}

export default new AgeGate();
