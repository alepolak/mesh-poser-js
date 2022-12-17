import react from 'react';
import './sidebar-panel.css';

const SidebarPanel = (props) => {
    return (
        <div className='panel'>
            <p className='title'> MODEL </p>
            {props.children}
        </div>
    );
};

export default SidebarPanel;