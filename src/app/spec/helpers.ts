import { of } from 'rxjs';


export class ActivatedRouteStub {
  public data = of({});

  constructor(initialData) {
    this.setData(initialData);
  }

  public setData(data: {}) {
    this.data = of(data);
  }
}

export default ActivatedRouteStub;
