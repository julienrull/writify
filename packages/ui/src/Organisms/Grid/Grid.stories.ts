import type { Meta, StoryObj } from "@storybook/react";
import { Grid, GridNode } from './Grid';
import React from 'react';

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
        direction: "horizontal",
}
let A: GridNode = {
        type: "LEAF",
        weight: 40,
        direction: "horizontal",
}

let B: GridNode = {
        type: "INTERNAL",
        weight: 60,
        direction: "horizontal",
}

let C: GridNode = {
        type: "LEAF",
        weight: 70,
        direction: "horizontal",
}

let D: GridNode = {
        type: "LEAF",
        weight: 65,
        direction: "horizontal",
}

gridState.set(root, [A, B]);
gridState.set(A, [root]);
gridState.set(B, [root, C, D]);
gridState.set(C, [B]);
gridState.set(D, [B]);

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Primary: Story = {
        args: {
                config: {
                        renderer: null,
                        state: gridState
                }
        },
};
