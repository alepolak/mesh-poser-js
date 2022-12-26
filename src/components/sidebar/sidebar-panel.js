import React from 'react';
import './sidebar-panel.css';

const SidebarPanel = (props) => {
    return (
        <div className='panel'>
            <p className='title'> {props.title} </p>
            {props.children}
        </div>
    );
};

export default SidebarPanel;