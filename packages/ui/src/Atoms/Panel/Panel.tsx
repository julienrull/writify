import React, { useEffect, useRef } from "react";
import "./panel.css";
import { useState } from 'react';



interface PanelProps {
        children: JSX.Element[],
        direction: 'horizontal' | 'vertical',
        handlePosition?: string,
}

/**
 * Primary UI component for user interaction
 */
export const Panel = ({
        direction = 'horizontal',
        children,
        handlePosition,
        ...props
}: PanelProps) => {
        const panelElement: React.RefObject<HTMLTableSectionElement> = useRef<HTMLTableSectionElement>(null);
        useEffect(() => {
                let position = '50%';
                if(handlePosition) {
                        position = handlePosition;
                }
                panelElement.current?.style.setProperty("--handle-position", position);
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
                <section className={direction === 'horizontal' ? 'panel panel-horizontal' : 'panel panel-vertical'} ref={panelElement}>
                        <section>{children[0]}</section>
                        {children.length > 1 ? 
                        <section>
                                <div className="panel-handle" onPointerDown={onPanelHandleDown}></div>
                                {children[1]}
                        </section> : 
                        undefined
                        }
                </section>
        );
};
