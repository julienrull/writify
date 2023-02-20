import React, { useEffect, useRef } from "react";
import styles from "./panel.module.css";



interface PanelProps {
        children: JSX.Element[],
        direction: 'horizontal' | 'vertical',
        handlePosition?: string,
        handleLimit?: string,
}

/**
 * Primary UI component for user interaction
 */
export const Panel = ({
        direction = 'horizontal',
        children,
        handlePosition,
        handleLimit,
        ...props
}: PanelProps) => {
        const panelElement: React.RefObject<HTMLTableSectionElement> = useRef<HTMLTableSectionElement>(null);
        useEffect(() => {
                let position = children.length > 1 ? '50%' : '100%';
                let limit = '1px';
                if(handlePosition) {
                        position = handlePosition;
                }
                if(handleLimit) {
                        limit = handleLimit;
                }
                panelElement.current?.style.setProperty("--handle-position", position);
                panelElement.current?.style.setProperty("--handle-limit", limit);
        }, []);
        const onPanelHandleDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                e.preventDefault();
                const parentRect = panelElement.current?.getBoundingClientRect();
                const onPointerMove =  (e: MouseEvent) => {
                        if(direction === "horizontal") {
                                let x = 0;
                                if(parentRect){
                                        x = e.pageX - parentRect?.x
                                }
                                panelElement.current?.style.setProperty("--handle-position", x + "px");
                        }else {
                                let y = 0;
                                if(parentRect){
                                        y = e.pageY - parentRect?.y
                                }
                                panelElement.current?.style.setProperty("--handle-position", y + "px");
                        }
                }
                const onPointerUp =  (e: MouseEvent) => {
                        document.removeEventListener('pointermove', onPointerMove);
                }
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp, {once: true});
        }
        return (
                <section className={direction === 'horizontal' ? styles.panel + ' ' + styles['panel-horizontal'] : styles.panel + ' ' + styles['panel-vertical']} ref={panelElement}>
                        <section>{children[0]}</section>
                        {children.length > 1 ? 
                        <section>
                                <div className={styles['panel-handle']} onPointerDown={onPanelHandleDown}></div>
                                {children[1]}
                        </section> : 
                        undefined
                        }
                </section>
        );
};
