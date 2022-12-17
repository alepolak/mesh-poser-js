import react from 'react';
import './model-panel.css';

const ModelPanel = (props) => {
    return (
        <div className='panel'>
            {props.children}
        </div>
    );
};

export default ModelPanel;