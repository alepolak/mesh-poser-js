import React from 'react';
import './sidebar-panel.css';

const SidebarPanel = (props) => {
    return (
        <div className='panel'>
            <p className='panel__title'> {props.title} </p>
            {props.children}
        </div>
    );
};

export default SidebarPanel;