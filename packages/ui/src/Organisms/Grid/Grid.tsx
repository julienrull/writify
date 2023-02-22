import "./grid.css";
import React, { useState } from 'react';
import { Panel } from '../../Moleculs/Panel/Panel';

/* COMPONENT STATE */
export interface GridNode {
        type: "ROOT" | "LEAF" | "INTERNAL",
        weight: number,
        direction: "horizontal" | "vertical",
        data?: {
                component: string | React.ComponentType<any>,
                props:{
                        [key: string]: any
                }
        }
}
interface GridConfig {
        state: Map<GridNode, GridNode[]>;
}
interface GridProps {
        config: GridConfig,
        removeNode?: (node: GridNode) => void,
        updateNode?: (node: GridNode) => void,
        addNode?: (targetNode: GridNode, newNode: GridNode) => void,
}


/**
 * Primary UI component for user interaction
 */
export const Grid = ({
        config,
        ...props
}: GridProps) => {
        function moveNode(sourceNode: GridNode, targetNode: GridNode){
                if(props.removeNode && props.addNode){
                        let movedNode = sourceNode;
                        props.removeNode(sourceNode);
                        props.addNode(targetNode, movedNode);
                }
        }
        function render(node: GridNode): JSX.Element[] {
                let elements: JSX.Element[] = [];
                let nodes = config.state.get(node); 
                if(nodes && node.type === "INTERNAL") {
                        nodes.forEach((nd, i) => {
                                if(i > 0) {
                                        elements = [...elements, ...render(nd)];
                                }
                        });
                }else if(nodes && node.type === "ROOT"){
                        nodes.forEach((nd) => {
                                elements =[...elements, ...render(nd)];
                        });
                }else{
                        let element = <></>;
                        if(node.data) {
                                let element = node.data.component;
                                elements.push(
                                        React.createElement(element, {key: node.weight + 1, ...node.data.props})
                                );
                        }
                }
                return [
                        <Panel key={node.weight} direction={node.direction} >
                                {elements}
                        </Panel>
                ];
        }
        return (
                <div className="grid">
                        {render(config.state.keys().next().value)}
                </div>
        );
};
