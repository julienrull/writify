import styles from './Panel.module.css';
import Editor from './../editor/Editor'
import { onMount, createSignal } from "solid-js";

const SIDEBAR_WIDTH = 'SidebarWith';

const Direction = {
    "HORIZONTAL": 0,
    "VERTICAL": 1,
    "NO_SPLIT": 2
}




function Panel(props) {

    const [directionStatus, setDirectionStatus] = createSignal(Direction[props.direction] !== undefined ? Direction[props.direction] : Direction.HORIZONTAL);

    let container;
    let resizer;
    

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
            let position = 0;
            if (Direction[props.direction] === Direction.HORIZONTAL) {
                position = e.pageX - container.offsetLeft
            }
            else if(Direction[props.direction] === Direction.VERTICAL){
                position = e.pageY - container.offsetTop
            }
            cb(position);
        }
    }

    onMount(() => {
        const oldSidebarWith = sessionStorage.getItem(SIDEBAR_WIDTH);
        if(oldSidebarWith != null) {
            container.style.setProperty('--sidebar', oldSidebarWith);
        }
        resize(resizer, rafThrottle( function(x) {
            const SidebarWith = x + 'px';
            sessionStorage.setItem(SIDEBAR_WIDTH, SidebarWith);
            container.style.setProperty('--sidebar', SidebarWith);
        }));
    });
    return (
        <div ref={container} classList={{[styles.Container]: true, [styles.Horizontal]: Direction[props.direction] === Direction.HORIZONTAL, [styles.Vertical]: Direction[props.direction] === Direction.VERTICAL, [styles.NoSplit]: Direction[props.direction] === Direction.NO_SPLIT}}>
            <div class={styles.First}>
                <Editor/>
                <div ref={resizer} classList={{[styles.Resizer]: true, [styles.ResizerHorizontal]: Direction[props.direction]=== Direction.HORIZONTAL, [styles.ResizerVertical]: Direction[props.direction] === Direction.VERTICAL}}></div>
            </div>
            <div classList={{[styles.Second]: true, [styles.NoSplit]: Direction[props.direction] === Direction.NO_SPLIT}}>
                <Editor/>
            </div>
        </div>
    );
}

export default Panel;