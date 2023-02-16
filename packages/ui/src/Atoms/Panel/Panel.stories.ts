import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel";
import React from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
        title: "Atoms/Panel",
        component: Panel,
        tags: ["autodocs"],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Primary: Story = {
        args: {
                children: [
                        React.createElement("p", null, `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum mauris odio, eget venenatis leo volutpat et.`),
                        React.createElement("p", null, `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum mauris odio, eget venenatis leo volutpat et.`)
                ],
                direction: 'horizontal',
                handlePosition: '30%',
        },
};
