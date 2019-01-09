import { of } from 'rxjs';


export class ActivatedRouteStub {
  public data = of({});
  public params = of({});

  constructor(initialData = {}) {
    this.setData(initialData);
  }

  public setData(data: {}) {
    this.data = of(data);
  }

  public setParams(params: {}) {
    this.params = of(params)
  }
}

export default ActivatedRouteStub;
