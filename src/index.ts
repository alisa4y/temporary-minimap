import {makeInterActElement} from "./tools/InterActElm";
import {setMinimap} from "./tools/minimap"

console.log("setting up minimap");
setMinimap();

// window.onload = ()=> {
//     let header = document.body.children[0] as HTMLElement;
    
//     let h1 = header.children[0] as HTMLElement;
//     header.addEventListener("click", (e)=> {
//         console.log("header clicked")
//         // e.stopImmediatePropagation();
//     }, true)
//     h1.addEventListener("click", ()=> {
//         console.log("h1 clicked");
//     })
// }

