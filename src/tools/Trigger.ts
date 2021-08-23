type triggerFunction<T> = (value: any, state: T) => void;

class Trigger<T, E> {
  state: T;
  private resetState: (s: T) => void;
  private listeners: {
    [index: string]: triggerFunction<T>[];
  };
  private multiListenersInfo: { [index: string]: E[] };
  private incomingEvents: {
    event: string;
    params: any;
  }[];
  private acitveEvents: {
    [event: string]: {
      date: ReturnType<typeof Date.now>;
      params: any;
      throttleTime: number;
      startTimer: ReturnType<typeof setTimeout>;
      stopTimer: ReturnType<typeof setTimeout>;
    };
  };
  private gThrottleTime: number;
  private hanging: boolean;
  constructor(o: T, rfun: (s: T) => void) {
    this.state = { ...o };
    this.listeners = {};
    this.resetState = rfun;
    this.multiListenersInfo = {};
    this.incomingEvents = [];
    this.acitveEvents = {};
    this.gThrottleTime = 0;
    this.hanging = false;
  }
  trigger(f: triggerFunction<T>, ...events: E[]) {
    let k;
    if (events.length === 1) {
      k = events[0] as unknown as string;
    } else {
      k = events.sort().join(" | ");
      if (this.multiListenersInfo[k] === undefined)
        this.multiListenersInfo[k] = events;
    }
    if (this.listeners[k] === undefined) this.listeners[k] = [];
    this.listeners[k].push(f);
  }
  start(event: E, params: any) {
    if (this.hanging) return;
    let e = event as any as string;
    let throtTime = this.acitveEvents[e]?.throttleTime || this.gThrottleTime;
    this.acitveEvents[e] ??= {} as any;
    this.acitveEvents[e].date = Date.now();
    this.acitveEvents[e].params = params;
    if (throtTime > 0) {
      this.acitveEvents[e].startTimer ??= setTimeout(() => {
        this.cleanTimeout(e, "stopTimer");
        this._start(event);
        this.acitveEvents[e].startTimer = undefined;
      }, throtTime);
    } else this._start(event);
  }
  private _start(event: E): void {
    this.react(event);
    this.reactToMultiEvents();
  }
  private react(event: E) {
    let e = event as unknown as string;
    if (this.listeners[e] !== undefined)
      this.listeners[e].forEach((f) =>
        f(this.acitveEvents[e].params, this.state)
      );
    this.reactToMultiEvents();
  }
  private reactToMultiEvents() {
    Object.keys(this.multiListenersInfo)
      .sort(
        (a, b) =>
          this.multiListenersInfo[a].length - this.multiListenersInfo[b].length
      )
      .filter(
        (k) =>
          k in this.listeners &&
          this.multiListenersInfo[k].every(
            (ev) => (ev as unknown as string) in this.acitveEvents
          )
      )
      .forEach((k) => {
        let params = this.multiListenersInfo[k].reduce((o, event) => {
          let e = event as unknown as string;
          o[e] = this.acitveEvents[e].params;
          return o;
        }, {} as any);
        this.listeners[k].forEach((f) => f(params, this.state));
      });
  }
  stop(event: E) {
    if (this.hanging) return;
    let e = event as unknown as string;
    if (this.acitveEvents[e] === undefined) return;
    let throtTime = this.acitveEvents[e]?.throttleTime || this.gThrottleTime;
    if (throtTime > 0) {
      this.acitveEvents[e].stopTimer ??= setTimeout(() => {
        this.cleanTimeout(e, "startTimer");
        this._stop(e);
      }, throtTime);
    } else this._stop(e);
  }
  private _stop(event: string) {
    delete this.acitveEvents[event];
    this.reset();
  }
  stopAll() {
    setTimeout(() => {
      this.acitveEvents = {};
    }, this.gThrottleTime);
  }
  private reset() {
    this.resetState(this.state);
    Object.keys(this.acitveEvents)
      .sort((a, b) => this.acitveEvents[a].date - this.acitveEvents[b].date)
      .forEach((k) =>
        this.listeners[k]?.forEach((f) =>
          f(this.acitveEvents[k].params, this.state)
        )
      );
    this.reactToMultiEvents();
  }
  private cleanTimeout(e: string, timerKey: "startTimer" | "stopTimer") {
    clearTimeout(this.acitveEvents[e][timerKey]);
    this.acitveEvents[e][timerKey] = undefined;
  }
  throttle(time: number, event?: E) {
    let e = event as any as string;
    if (e) {
      this.acitveEvents[e] ??= {} as any;
      this.acitveEvents[e].throttleTime = time;
    } else this.gThrottleTime = time;
  }
  hang(v = true) {
    this.hanging = v;
  }
  reactTo(event: E, params: any) {
    let e = event as any as string;
    if (this.acitveEvents[e] !== undefined) {
      this.acitveEvents[e].params= params;
      this._start(event);   
    }
  }
}

export { Trigger };
