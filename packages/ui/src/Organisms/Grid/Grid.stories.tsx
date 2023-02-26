import type { Meta, StoryObj } from "@storybook/react";
import { Grid, GridNode, Position } from './Grid';
import { useArgs } from "@storybook/client-api";
// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: "Organisms/Grid",
  component: Grid,
  tags: ["autodocs"],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/* INIT STATE */
let gridState = new Map<GridNode, GridNode[]>();
let root: GridNode = {
  type: "ROOT",
  weight: 50,
  direction: "vertical",
};
let A: GridNode = {
  type: "LEAF",
  weight: 40,
  direction: "horizontal",
  data: {
    component: "div",
    props: {
      children: "Hello I'm A",
    },
  },
};

let B: GridNode = {
  type: "INTERNAL",
  weight: 60,
  direction: "horizontal",
};

let C: GridNode = {
  type: "LEAF",
  weight: 70,
  direction: "horizontal",
  data: {
    component: "div",
    props: {
      children: "Hello I'm C",
    },
  },
};

let D: GridNode = {
  type: "LEAF",
  weight: 65,
  direction: "horizontal",
  data: {
    component: "div",
    props: {
      children: "Hello I'm D",
    },
  },
};

gridState.set(root, [A, B]);
gridState.set(A, [root]);
gridState.set(B, [root, C, D]);
gridState.set(C, [B]);
gridState.set(D, [B]);

export const Primary = {
  render: (args: any) => {
    const [argsState, updateArgs, resetArgs] = useArgs();
    function addNode(
      targetNode: GridNode,
      newNode: GridNode,
      position: Position
    ) {
        targetNode = A;
      newNode = {
        type: "LEAF",
        weight: 100,
        direction: "horizontal",
        data: {
          component: "div",
          props: {
            children: "NEW NODE",
          },
        },
      };
      let nodeContainer: GridNode = {
        type: "INTERNAL",
        weight: 200,
        direction: "horizontal",
      };
      let targetNodeDependencies = gridState.get(targetNode);
      if (targetNodeDependencies) {
        let parentNode = targetNodeDependencies[0];
        let parentNodeDependencies = gridState.get(parentNode);
        if (parentNodeDependencies) {
          let containerPosition = parentNodeDependencies.indexOf(targetNode);
          let postions =
          position === Position.BEFORE
              ? [newNode, targetNode]
              : [targetNode, newNode];
          gridState.set(nodeContainer, [parentNode, ...postions]);
          gridState.set(newNode, [nodeContainer]);
          gridState.set(targetNode, [nodeContainer]);
          parentNodeDependencies = parentNodeDependencies.filter(
            (node) => node !== targetNode
          );
          parentNodeDependencies.splice(containerPosition, 0, nodeContainer);
          gridState.set(parentNode, parentNodeDependencies);
          updateArgs({ ...args, grid: new Map(gridState) });
          console.log(args);
        }
      }
    }
    function removeNode(nodeToDelete: GridNode) {
      nodeToDelete = C;
      let nodeToDeleteDependencies = gridState.get(nodeToDelete);
      if (nodeToDeleteDependencies) {
        let nodeParent = nodeToDeleteDependencies[0];
        let nodeParentDependencies = gridState.get(nodeParent);
        if (nodeParentDependencies) {
          if (nodeParent.type !== "ROOT") {
            let nodeSibling = nodeParentDependencies.filter( (node, index) => index !== 0 && node !== nodeToDelete)[0];
            let nodeParentOfParent = nodeParentDependencies[0];
            let nodeParentOfParentDependencies =
              gridState.get(nodeParentOfParent);
            if (nodeParentOfParentDependencies) {
              let indexParent = nodeParentOfParentDependencies.indexOf(nodeParent);
              nodeParentOfParentDependencies.splice(indexParent, 0, nodeSibling );
              nodeParentOfParentDependencies = nodeParentOfParentDependencies.filter((node) => node !== nodeParent);
              console.log(nodeParentOfParentDependencies)
              gridState.set(nodeParentOfParent, nodeParentOfParentDependencies);
              let nodeSiblingDependencies = gridState.get(nodeSibling);
              if (nodeSiblingDependencies) {
                nodeSiblingDependencies.splice(0, 0, nodeParentOfParent);
                nodeSiblingDependencies = nodeSiblingDependencies.filter(
                  (node) => node !== nodeParent
                );
                gridState.set(nodeSibling, nodeSiblingDependencies);
                gridState.delete(nodeToDelete);
                gridState.delete(nodeParent);
                console.log("FIN REMOVE");
                console.log(gridState)
              }
            }
          } else {
            nodeParentDependencies = nodeParentDependencies.filter(
              (node) => node !== nodeToDelete
            );
            // TODO : delete map while iterate on it can be dangerous. Find another way : maybe temp array;
            for (let node of gridState.keys()) {
              if (!nodeParentDependencies.includes(node)) {
                gridState.delete(node);
              }
            }
            gridState.set(nodeParent, nodeParentDependencies);
            gridState.set(nodeParent, nodeParentDependencies);
          }
        }
      }
      updateArgs({ ...args, grid: new Map(gridState) });
      //console.log(args);
    }

    return <Grid {...args} removeNode={removeNode} addNode={addNode} />;
  },
  args: {
    grid: gridState,
  },
};

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
/*
export const Primary: Story = {
        args: {
                config: {
                        renderer: null,
                        state: gridState
                },
                removeNode: removeNode
        },
};
*/
/*
export const Primary = (args: any) => <Grid {...args}  />;
Primary.args = {
        config: { state: gridState }
}
*/
