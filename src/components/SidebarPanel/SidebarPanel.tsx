import styles from './SidebarPanel.module.css';
import { onMount, Component, Show, createEffect, createSignal } from 'solid-js';
import throttled from '../../helpers/Throttled';
import { Layout, useLayer } from '../../application/LayerProvider';


enum Direction {
    HORIZONTAL = 0,
    VERTICAL = 1,
    NO_SPLIT = 2
}

export interface PanelProps{
    layout: Layout
    children?: any;
}

const SidebarPanel: Component<PanelProps> = (props) => {

    const [layerState, layerController] = useLayer();
    const [pos, setPos] = createSignal(0);
    createEffect(() =>{
        sessionStorage.setItem(props.layout.id, props.layout.position || "");
    });

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
            if (props.layout.direction === Direction.HORIZONTAL) {
                position = e.pageX - containerRect.x;
            }
            else if(props.layout.direction === Direction.VERTICAL){
                position = e.pageY - containerRect.y;
            }
            cb(position);
        }
    }

    onMount(() => {
        const oldSidebarWidth = sessionStorage.getItem(props.layout.id);
        if(oldSidebarWidth != null) {
            container.style.setProperty('--sidebar', oldSidebarWidth);
        }
        resize(resizer, throttled(function(x) {
            setPos(x);
            const SidebarWidth = x + 'px';
            container.style.setProperty('--sidebar', SidebarWidth);
        }));
    });
    return (
        <div ref={container} classList={{[styles.PanelContainer]: true, [styles.Horizontal]: props.layout.direction === Direction.HORIZONTAL, [styles.Vertical]: props.layout.direction === Direction.VERTICAL, [styles.NoSplit]: props.layout.direction === Direction.NO_SPLIT}}>
            <div classList={{[styles.First]: true, [styles.BorderRight]: props.layout.direction === Direction.HORIZONTAL, [styles.BorderBottom]: props.layout.direction === Direction.VERTICAL,}}>
                {props.children.length > 1 ? props.children[0]: props.children}
                <Show when={props.layout.direction !== Direction.NO_SPLIT} fallback={<div>Loading...</div>}>
                    <div ref={resizer} classList={{[styles.Resizer]: true, [styles.ResizerHorizontal]: props.layout.direction=== Direction.HORIZONTAL, [styles.ResizerVertical]: props.layout.direction === Direction.VERTICAL}}></div>
                </Show>
            </div>
            <div classList={{[styles.Second]: true, [styles.NoSplit]: props.layout.direction === Direction.NO_SPLIT}}>
                {props.children[1]}
            </div>
        </div>
    );
}

export {SidebarPanel, Direction};