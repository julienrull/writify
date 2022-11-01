import styles from './Panel.module.css';
import Editor from './../editor/Editor'
import { onMount } from "solid-js";

function Panel() {

    let resizer;

    const SIDEBAR_WIDTH = 'SidebarWith';

    function rafThrottle(callback) {
        let requestId = null
      
        let lastArgs
      
        const later = (context) => () => {
          requestId = null
          callback.apply(context, lastArgs)
        }
      
        const throttled = function(...args) {
          lastArgs = args;
          if (requestId === null) {
            requestId = requestAnimationFrame(later(this))
          }
        }
      
        throttled.cancel = () => {
          cancelAnimationFrame(requestId)
          requestId = null
        }
      
        return throttled
    }

    function resize(element, cb){
        element.addEventListener('pointerdown', onPointerDown);

        function onPointerDown(e){
            e.preventDefault();
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp, {once: true});
        }

        function onPointerUp(e){
            document.removeEventListener('pointermove', onPointerMove);
        }

        function onPointerMove(e){
            e.preventDefault();
            cb(e.pageX);
        }
    }

    onMount(() => {
        const oldSidebarWith = sessionStorage.getItem(SIDEBAR_WIDTH);
        if(oldSidebarWith != null) {
            document.body.style.setProperty('--sidebar', oldSidebarWith);
        }
        resize(resizer, rafThrottle( function(x) {
            const SidebarWith = x + 'px';
            sessionStorage.setItem(SIDEBAR_WIDTH, SidebarWith);
            document.body.style.setProperty('--sidebar', SidebarWith);
        }));
    });

    return (
        <div class={styles.Container}>
            <div class={styles.First}>
                <Editor/>
                <div ref={resizer} class={styles.Resizer}></div>
            </div>
            <div class={styles.Second}>
                <Editor/>
            </div>
        </div>
    );
}

export default Panel;