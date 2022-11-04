import styles from './Panel.module.css';
import { onMount, Component, Switch, Match, children } from "solid-js";
import throttled from '../../helpers/Throttled';


enum Direction {
    HORIZONTAL = 0,
    VERTICAL = 1,
    NO_SPLIT = 2
}

interface PanelProps{
    direction: Direction;
    children?: any;
}

const SIDEBAR_WIDTH = 'SidebarWidth';

const Panel: Component<PanelProps> = (props) => {

    let container: HTMLDivElement = document.createElement("div");
    let resizer: HTMLDivElement  = document.createElement("div"); 
    
    function resize(element: HTMLDivElement, cb: (x: any) => void): void {
        element.addEventListener('pointerdown', onPointerDown);

        function onPointerDown(e: PointerEvent){
            e.preventDefault();
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp, {once: true});
        }

        function onPointerUp(e: PointerEvent){
            document.removeEventListener('pointermove', onPointerMove);
        }

        function onPointerMove(e: PointerEvent){
            e.preventDefault();
            let position = 0;
            if (props.direction === Direction.HORIZONTAL) {
                position = e.pageX - container.offsetLeft;
            }
            else if(props.direction === Direction.VERTICAL){
                position = e.pageY - container.offsetTop;
            }
            cb(position);
        }
    }

    onMount(() => {
        const oldSidebarWidth = sessionStorage.getItem(SIDEBAR_WIDTH);
        if(oldSidebarWidth != null) {
            container.style.setProperty('--sidebar', oldSidebarWidth);
        }
        resize(resizer, throttled( function(x) {
            const SidebarWidth = x + 'px';
            sessionStorage.setItem(SIDEBAR_WIDTH, SidebarWidth);
            container.style.setProperty('--sidebar', SidebarWidth);
        }));
    });
    console.log(props.children.length);
    return (
        <div ref={container} classList={{[styles.Container]: true, [styles.Horizontal]: props.direction === Direction.HORIZONTAL, [styles.Vertical]: props.direction === Direction.VERTICAL, [styles.NoSplit]: props.direction === Direction.NO_SPLIT}}>
            <div class={styles.First}>
                {props.children.lenght > 1 ? props.children[0]: props.children}
                <div ref={resizer} classList={{[styles.Resizer]: true, [styles.ResizerHorizontal]: props.direction=== Direction.HORIZONTAL, [styles.ResizerVertical]: props.direction === Direction.VERTICAL}}></div>
            </div>
            <div classList={{[styles.Second]: true, [styles.NoSplit]: props.direction === Direction.NO_SPLIT}}>
                {props.children[1]}
            </div>
        </div>
    );
}

export {Panel, Direction};