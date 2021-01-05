import React from 'react';
import { Story, Meta } from '@storybook/react'
import { Calendar ,CalendarProps} from '../src/components/Calendar'

const meta: Meta = {
    title: 'Components/Calendar',
    Component: Calendar,
    argTypes: {
        minDate: {
            control: {
                type: 'date',
            }
        },
        maxDate: {
            control: {
                type: 'date'
            }
        },
        onChange: {
            table: {
              category:'Events'  
            },
            action: 'changed'
        }
    }
} as Meta;

export default meta;

const Template: Story<CalendarProps> = (args) => <Calendar {...args} />;

export const Basic = Template.bind({}); 

Basic.args = {
    useMoveToMonth: true,
    useMoveToYear: true,
    showDate: true,
    highlightToday:true,
};