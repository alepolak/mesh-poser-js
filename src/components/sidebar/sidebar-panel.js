import react from 'react';
import './sidebar-panel.css';

const SidebarPanel = (props) => {
    return (
        <div className='panel'>
            {props.children}
        </div>
    );
};

export default SidebarPanel;