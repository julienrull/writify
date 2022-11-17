import styles from './Panel.module.css';
import { onMount, Component, Show } from "solid-js";
import throttled from '../../helpers/Throttled';


enum Direction {
    HORIZONTAL = 0,
    VERTICAL = 1,
    NO_SPLIT = 2
}

export interface PanelProps{
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
            let containerRect = container.getBoundingClientRect();
            if (props.direction === Direction.HORIZONTAL) {
                position = e.pageX - containerRect.x;
            }
            else if(props.direction === Direction.VERTICAL){
                position = e.pageY - containerRect.y;
            }
            cb(position);
        }
    }

    onMount(() => {
        const oldSidebarWidth = sessionStorage.getItem(SIDEBAR_WIDTH);
        if(oldSidebarWidth != null) {
            //container.style.setProperty('--sidebar', oldSidebarWidth);
        }
        resize(resizer, throttled( function(x) {
            const SidebarWidth = x + 'px';
            //sessionStorage.setItem(SIDEBAR_WIDTH, SidebarWidth);
            container.style.setProperty('--sidebar', SidebarWidth);
        }));
    });
    return (
        <div ref={container} classList={{[styles.PanelContainer]: true, [styles.Horizontal]: props.direction === Direction.HORIZONTAL, [styles.Vertical]: props.direction === Direction.VERTICAL, [styles.NoSplit]: props.direction === Direction.NO_SPLIT}}>
            <div classList={{[styles.First]: true, [styles.BorderRight]: props.direction === Direction.HORIZONTAL, [styles.BorderBottom]: props.direction === Direction.VERTICAL,}}>
                {props.children.length > 1 ? props.children[0]: props.children}
                <Show when={props.direction !== Direction.NO_SPLIT} fallback={<div>Loading...</div>}>
                    <div ref={resizer} classList={{[styles.Resizer]: true, [styles.ResizerHorizontal]: props.direction=== Direction.HORIZONTAL, [styles.ResizerVertical]: props.direction === Direction.VERTICAL}}></div>
                </Show>
            </div>
            <div classList={{[styles.Second]: true, [styles.NoSplit]: props.direction === Direction.NO_SPLIT}}>
                {props.children[1]}
            </div>
        </div>
    );
}

export {Panel, Direction};