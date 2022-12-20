import react from 'react';
import './model-panel.css';
import FileButton from '../../FileButton';
import SidebarPanel from './sidebar-panel';

const ModelPanel = (props) => {
    
    const drawScaleInput = () => {
        return (
            <div className='scale__menu'>
                <p className='scale__label'>Scale:</p>
                <input className='scale__input' ref={props.scaleRef} onChange={props.onScaleChange} type="number" />
            </div>
        );
    };

    return (
        <SidebarPanel title={'MODEL'}>
            <FileButton
                buttonLabel="Load model"
                onModelLoad={props.onModelLoad}
                isMultiple={false}
            />
            {drawScaleInput()}
        </SidebarPanel>
    );
};

export default ModelPanel;