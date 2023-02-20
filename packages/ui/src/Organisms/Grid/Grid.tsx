import "./grid.css";
import { useState } from 'react';
import { Panel } from '../../Moleculs/Panel/Panel';

/* COMPONENT STATE */
export interface GridNode {
        type: "ROOT" | "LEAF" | "INTERNAL",
        weight: number,
        direction: "horizontal" | "vertical",
        data?: {
                type: string,
                content:{
                        [key: string]: any
                }
        }
}
interface GridConfig {
        renderer: Map<string, JSX.Element> | null,
        state: Map<GridNode, GridNode[]>;
}
interface GridProps {
        config: GridConfig
}

/* COMPONENT UTILITIES */

function addNode(){}
function removeNode(){}
function updateNode(){}


/**
 * Primary UI component for user interaction
 */
export const Grid = ({
        config,
        ...props
}: GridProps) => {
        // Créer une classe (un type) pour gérer les arbres
        const [gridConfig, setGridConfig] = useState<GridConfig>();
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
                        elements.push(
                                <div key={node.weight + 1}>{node.type}</div>
                        );
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
