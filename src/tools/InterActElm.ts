/*
TODO
onResize implement 
resize implement

*/
import { Trigger } from "./Trigger";
type UIMouseEvents =
  | "inside"
  | "holded" // when mouse is holded down
  | "top" // when near top edge and others...
  | "bottom"
  | "right"
  | "left";

interface UIMEState {
  mouse: {
    x: number;
    y: number;
  };
  translate: {
    x: number;
    y: number;
  };
}
const defaultConfig = {
  resize: true,
  move: true,
  inParent: true,
  accelerate: 1,
  onMove: (x:number, y:number)=>{},
  onResize: (x:number, y:number)=>{},
};
type InterActElm = typeof defaultConfig;
const edgeRaduis = 20;
export function makeInterActElement(
  elm: HTMLElement,
  config: { [key in keyof typeof defaultConfig]?: InterActElm[key] }
) {
  config = {...defaultConfig, ...config}
  let trig = new Trigger<UIMEState, UIMouseEvents>(
    { mouse: { x: 0, y: 0 }, translate: { x: 0, y: 0 } },
    (s) => {
      elm.style.cursor = "auto";
    }
  );
  trig.trigger(() => (elm.style.cursor = "w-resize"), "left");
  trig.trigger(() => (elm.style.cursor = "e-resize"), "right");
  trig.trigger(() => (elm.style.cursor = "n-resize"), "top");
  trig.trigger(() => (elm.style.cursor = "s-resize"), "bottom");
  trig.trigger(() => (elm.style.cursor = "grab"), "inside");
  trig.trigger(() => (elm.style.cursor = "nw-resize"), "top", "left");
  trig.trigger(() => (elm.style.cursor = "ne-resize"), "top", "right");
  trig.trigger(() => (elm.style.cursor = "sw-resize"), "bottom", "left");
  trig.trigger(() => (elm.style.cursor = "se-resize"), "bottom", "right");
  trig.trigger(
    ({ holded: e }, s) => {
      let me = e as MouseEvent;
      let width = elm.offsetWidth;
      let dis = me.clientX - s.mouse.x;
      dis *= config.accelerate;
      s.mouse.x = me.clientX;
      if (config.inParent) {
        let rect = elm.getBoundingClientRect();
        let parentRect = elm.parentElement.getBoundingClientRect();
        if (parentRect.left > rect.left + dis)
          dis = parentRect.left - rect.left;
      }
      elm.style.width = width - dis + "px";
      s.translate.x += dis;
      elm.style.transform = `translate(${s.translate.x}px, ${s.translate.y}px)`;
    },
    "left",
    "holded"
  );
  trig.trigger(
    ({ holded: e }, s) => {
      let me = e as MouseEvent;
      let width = elm.offsetWidth;
      let dis = me.clientX - s.mouse.x;
      dis *= config.accelerate;
      s.mouse.x = me.clientX;
      if (config.inParent) {
        let rect = elm.getBoundingClientRect();
        let parentRect = elm.parentElement.getBoundingClientRect();
        if (parentRect.right < rect.right + dis)
          dis = parentRect.right - rect.right;
      }
      elm.style.width = width + dis + "px";
    },
    "right",
    "holded"
  );
  trig.trigger(
    ({ holded: e }, s) => {
      let me = e as MouseEvent;
      let height = elm.offsetHeight;
      let dis = me.clientY - s.mouse.y;
      dis *= config.accelerate;
      s.mouse.y = me.clientY;
      if (config.inParent) {
        let rect = elm.getBoundingClientRect();
        let parentRect = elm.parentElement.getBoundingClientRect();
        if (parentRect.top > rect.top + dis) dis = parentRect.top - rect.top;
      }
      elm.style.height = height - dis + "px";
      s.translate.y += dis;
      elm.style.transform = `translate(${s.translate.x}px, ${s.translate.y}px)`;
    },
    "top",
    "holded"
  );
  trig.trigger(
    ({ holded: e }, s) => {
      let me = e as MouseEvent;
      let height = elm.offsetHeight;
      let dis = me.clientY - s.mouse.y;
      dis *= config.accelerate;
      s.mouse.y = me.clientY;
      if (config.inParent) {
        let rect = elm.getBoundingClientRect();
        let parentRect = elm.parentElement.getBoundingClientRect();
        if (parentRect.bottom < rect.bottom + dis)
          dis = parentRect.bottom - rect.bottom;
      }
      elm.style.height = height + dis + "px";
    },
    "bottom",
    "holded"
  );
  trig.trigger(
    ({ holded: e }, s) => {
      let me = e as MouseEvent;
      elm.style.cursor = "grabbing";
      let disX = me.clientX - s.mouse.x;
      let disY = me.clientY - s.mouse.y;
      disX *= config.accelerate;
      disY *= config.accelerate;
      let rect = elm.getBoundingClientRect();
      let parentRect = elm.parentElement.getBoundingClientRect();
      if (config.inParent) {
        if (rect.width < parentRect.width) {
          if (parentRect.left > rect.left + disY)
            disX = parentRect.left - rect.left;
          if (parentRect.right < rect.right + disY)
            disX = parentRect.right - rect.right;
          s.translate.x += disX;
        }
        if (rect.height < parentRect.height) {
          if (parentRect.top > rect.top + disY)
            disY = parentRect.top - rect.top;
          if (parentRect.bottom < rect.bottom + disY)
            disY = parentRect.bottom - rect.bottom;
          s.translate.y += disY;
        }
      } else {
        s.translate.x += disX;
        s.translate.y += disY;
      }
      elm.style.transform = `translate(${s.translate.x}px, ${s.translate.y}px)`;
      s.mouse.x = me.clientX;
      s.mouse.y = me.clientY;
      config.onMove?.(s.translate.x, s.translate.y);
    },
    "inside",
    "holded"
  );
  function mousemove(e: MouseEvent) {
    let onEdge = false;
    let me = e as MouseEvent;
    let rect = elm.getBoundingClientRect();
    if (config.resize) {
      if (Math.abs(me.clientX - rect.left) < edgeRaduis) {
        trig.start("left", me);
        onEdge = true;
      } else trig.stop("left");
      if (Math.abs(me.clientX - rect.right) < edgeRaduis) {
        trig.start("right", me);
        onEdge = true;
      } else trig.stop("right");
      if (Math.abs(me.clientY - rect.top) < edgeRaduis) {
        trig.start("top", me);
        onEdge = true;
      } else trig.stop("top");
      if (Math.abs(me.clientY - rect.bottom) < edgeRaduis) {
        trig.start("bottom", me);
        onEdge = true;
      } else trig.stop("bottom");
    }
    if (config.move) {
      if (!onEdge || !config.resize) trig.start("inside", me);
      else trig.stop("inside");
    }
    trig.reactTo("holded", e);
  }
  elm.addEventListener("pointermove", (e) => {
    e.preventDefault();
    mousemove(e);
  });
  elm.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    trig.state.mouse.x = e.clientX;
    trig.state.mouse.y = e.clientY;
    trig.start("holded", e);
    elm.setPointerCapture(e.pointerId);
    trig.hang();
  });
  elm.addEventListener("pointerup", (e) => {
    e.preventDefault();
    elm.releasePointerCapture(e.pointerId);
    trig.stopAll();
    trig.hang(false);
  });
  return {
    move: (x:number, y:number)=>{
      trig.state.translate.x = x;
      trig.state.translate.y = y;
      elm.style.transform = `translate(${x}px, ${y}px)`;
    }
  }
}
