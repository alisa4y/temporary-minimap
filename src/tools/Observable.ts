enum ChangeType {
  modify, // when changing value
  adding, // when adding key and value for 1st time aka initializing
  deleting, // when deleting key from object
}
type ObserverFunction = (value: any, obj: Object) => void;
type ObserverFunctions = {
  adding?: ObserverFunction;
  deleting?: ObserverFunction;
  modifying?: (newValue: any, oldValue: any, obj: Object) => void;
  any?: (newValue: any, oldValue: any, obj: Object, change: ChangeType) => void;
};
class Observeable {
  obj: {
    [key: string]: any;
  };
  private observers: {
    [key: string]: ObserverFunctions[];
  };
  private throttleData: {
    [key: string]: {
      time: number;
      value: any;
      timerFun: ReturnType<typeof setTimeout>;
    };
  };
  private gThrottleTime: number;
  constructor(o: Object) {
    this.obj = o;
    this.observers = {};
    this.gThrottleTime = 0;
  }
  observe(key: string, f: ObserverFunctions): void {
    (this.observers[key] ??= []).push(f);
  }
  set(key: string, value: any) {
    if(this.obj[key] === value) return;
    let throtTime = this.throttleData?.[key]?.time || this.gThrottleTime;
    if (throtTime > 0) {
      this.throttleData[key] ??= {} as any;
      this.throttleData[key].value = value;
      this.throttleData[key].timerFun ??= setTimeout(() => {
        this._set(key, this.throttleData[key].value);
        this.throttleData[key].timerFun = undefined;
      }, throtTime);
    } else this._set(key, value);
  }
  private _set(key: string, value: any): void {
    let exist = this.obj[key] !== undefined;
    let oldValue = this.obj[key];
    this.obj[key] = value;
    this.observers[key]?.forEach((f) => {
      exist
        ? f.modifying?.(value, oldValue, this.obj)
        : f.adding?.(value, this.obj);
      f.any?.(
        value,
        oldValue,
        this.obj,
        exist ? ChangeType.adding : ChangeType.modify
      );
    });
  }
  remove(key: string): void {
    if (this.obj[key] !== undefined) {
      this.observers[key]?.forEach((f) => {
        f.deleting?.(this.obj[key], this.obj);
        f.any?.(undefined, this.obj[key], this.obj, ChangeType.deleting);
      });
      this.obj[key] = undefined;
    }
  }
  throttle(time: number, key?: string) {
    if (key) {
      this.throttleData[key] ??= {} as any;
      this.throttleData[key].time = time;
    } else this.gThrottleTime = time;
  }
}

export { Observeable };
