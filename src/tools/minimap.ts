import { Observeable } from "./Observable";
import { makeInterActElement } from "./InterActElm";
import { setStyle } from "./shortCuts";

const maxMinimapHeight = 10000;
const minimapViewId = "--minimap-view--";
let gCurrentY = 0;

export function setMinimap() {
  let docRect = document.documentElement.getBoundingClientRect();
  let maxHeight = Math.max(maxMinimapHeight, docRect.height);
  let minimapOffset = maxHeight - docRect.height;
  let scale = window.innerHeight / (docRect.height +minimapOffset);
  let halfView = window.innerHeight/2 * scale;
  
  let minimap = createMinimapElement(scale);
  cloneBodyTo(minimap);
  let miniBody = minimap.children[0];
  
  let view = createMinimapViewer();
  miniBody.appendChild(view);
  
  let scroll = new Observeable({ y: 0 });
  miniBody.addEventListener("click", (e: MouseEvent)=>{
    let target = e.target as HTMLElement;
    if(target.id === minimapViewId) return;
    scroll.set('y', Math.round((e.clientY-halfView)/scale));
    console.log(e.clientY, scroll.obj.y);
    e.stopImmediatePropagation();
  }, true);
  
  let {move} = makeInterActElement(view, {
    resize: false,
    move: true,
    inParent: true,
    accelerate: window.innerHeight/scale/900,
    onMove:(x, y)=>{scroll.set('y', y)}
  });
  window.addEventListener("scroll", (e) => {
    scroll.set("y", window.scrollY);
  });
  scroll.observe("y", {
    modifying: (v) => {
      gCurrentY = v;
      window.scrollTo(0, v);
      move(0, v);
    },
  });
  scroll.set('y', gCurrentY);
  let interval = setInterval(()=> {
    let r = document.documentElement.getBoundingClientRect();
    if(Math.abs(docRect.height - r.height) > 100) {
      minimap.remove();
      setMinimap();
      clearInterval(interval);
    }
  }, 1000)
}


function createMinimapElement(scale:number) {
  let minimap = document.createElement("div");
  console.log(document.documentElement.getBoundingClientRect().width * scale);
  
  setStyle(minimap, {
    width: "100%",
    position: "fixed",
    top: "1%",
    marginRight: document.documentElement.getBoundingClientRect().width / 2 * scale + 10 + "px",
    right: "-50%",
    transform: `scale(${scale})`,
    zIndex: "1000000",
  });
  document.body.append(minimap);
  return minimap;
}
function cloneBodyTo(miniMapElment: HTMLElement) {
  miniMapElment.append(document.body.cloneNode(true));
  setStyle(miniMapElment.firstChild as HTMLElement, {
    width: "100%",
    position: "absolute",
  });
}
function createMinimapViewer() {
  let view = document.createElement("div");
  view.id = minimapViewId;
  setStyle(view, {
    width: "100vw",
    height: "100vh",
    border: "5px solid #444444",
    padding: "0% 55%",
    left: "-6%",
    position: "absolute",
    top: "0",
    background: "#afafaf52",
    zIndex: "1000000",
  });
  return view;
}