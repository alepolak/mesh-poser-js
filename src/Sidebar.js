import React from 'react';
import './Sidebar.css';
import icons from './Icons';
import FileButton from './FileButton';
import SidebarPanel from './components/sidebar/sidebar-panel';
import ModelPanel from './components/sidebar/model-panel';

const Sidebar = (props) => {

    /**
     *  Animation Menu
     * 
     */
    const drawAnimationMenu = () => {
        if(props.modelReady) {
            return (
                <SidebarPanel>
                    <p className='menu__title'> ANIMATIONS </p>
                    <FileButton
                        buttonLabel="Load animations"
                        onModelLoad={props.onAnimationLoad}
                        isMultiple={true}
                        />
                    <form className='animation__radios'>
                        {props.getAnimationButtons()}
                    </form> 
                </SidebarPanel>
            );
        }
    };

    /**
     *  Animation Player Menu
     * 
     */
    const drawAnimationPlayerMenu = () => {
        if(props.hasAnimations && props.maxAnimationFrame > 0) {
            return (
                <SidebarPanel>
                    <p className='menu__title'> FRAMES </p>
                    <div className='animation__frames'>
                        <button className='animation__toggle__button' onClick={props.onPauseContinue}>
                            <img src={getPlayPuseIcon()} alt='Pause animation'/>
                        </button>
                        <p className='animation__frames__data'> {props.animationFrame}/{props.maxAnimationFrame} </p>
                    </div>
                    <input className='animation__frames__slider' type="range" min="0" max={props.maxAnimationFrame} value={props.animationFrame} onChange={props.onAnimationFrameChange} step="1"/>  
                </SidebarPanel>
            );
        }
    };

    const getPlayPuseIcon = () => {
        return props.singleStepMode ? icons.play : icons.pause;
    }

    /**
     *  Export Menu
     * 
     */
    const drawExportMenu = () => {
        if(props.modelReady) {
            return (
                <SidebarPanel>    
                    <button  className='export__button' onClick={props.bake}> Bake mesh </button>
                </SidebarPanel>
            );
        }
    };

    return(
        <div className='sidebar'>
            <ModelPanel scaleRef={props.scaleRef} onScaleChange={props.onScaleChange} onModelLoad={props.onModelLoad}/>
            {drawAnimationMenu()}
            {drawAnimationPlayerMenu()}
            {drawExportMenu()}
        </div>
    );
};

export default Sidebar;