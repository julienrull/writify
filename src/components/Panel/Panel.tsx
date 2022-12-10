import styles from './Panel.module.css';
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

const Panel: Component<PanelProps> = (props) => {

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
            layerController.setLayout(props.layout.id, "position", pos());
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
        container.style.setProperty('--sidebar', props.layout.position + 'px');
        resize(resizer, throttled(function(x) {
            setPos(x);
            const SidebarWidth = x + 'px';
            container.style.setProperty('--sidebar', SidebarWidth);
        }));
    });

    const NO_CONTENT_VIEW = (
    <div class={styles.NoEditor}>
        <h1>There aren't open files</h1>
    </div>
    );

    return (
        <div ref={container} classList={{[styles.PanelContainer]: true, [styles.Horizontal]: props.layout.direction === Direction.HORIZONTAL, [styles.Vertical]: props.layout.direction === Direction.VERTICAL, [styles.NoSplit]: props.layout.direction === Direction.NO_SPLIT}}>
            <Show when={props.layout.children && props.layout.children.length > 0} fallback={NO_CONTENT_VIEW}>
                <div classList={{[styles.First]: true, [styles.BorderRight]: props.layout.direction === Direction.HORIZONTAL, [styles.BorderBottom]: props.layout.direction === Direction.VERTICAL,}}>
                    {props.children.length > 1 ? props.children[0]: props.children}
                    <Show when={props.layout.direction !== Direction.NO_SPLIT} fallback={<div>Loading...</div>}>
                        <div ref={resizer} classList={{[styles.Resizer]: true, [styles.ResizerHorizontal]: props.layout.direction=== Direction.HORIZONTAL, [styles.ResizerVertical]: props.layout.direction === Direction.VERTICAL}}></div>
                    </Show>
                </div>
                <div classList={{[styles.Second]: true, [styles.NoSplit]: props.layout.direction === Direction.NO_SPLIT}}>
                    {props.children[1]}
                </div>
            </Show>
        </div>
    );
}

export {Panel, Direction};