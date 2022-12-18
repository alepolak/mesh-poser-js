import React from 'react';
import './Sidebar.css';
import icons from './Icons';
import SidebarPanel from './components/sidebar/sidebar-panel';
import ModelPanel from './components/sidebar/model-panel';
import AnimationLoader from './components/sidebar/animationLoader-panel';

const Sidebar = (props) => {
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

    const drawMenus = () => {
        if(props.modelReady) {
            return(
                <AnimationLoader 
                    activeIndex={props.activeIndex}
                    animationList={props.animationList}
                    onAnimationLoad={props.onAnimationLoad}
                    onAnimationSelected={props.onAnimationSelected}
                />

            );
        }
    };

    return(
        <div className='sidebar'>
            <ModelPanel scaleRef={props.scaleRef} onScaleChange={props.onScaleChange} onModelLoad={props.onModelLoad}/>
            {drawMenus()}
            {drawAnimationPlayerMenu()}
            {drawExportMenu()}
        </div>
    );
};

export default Sidebar;