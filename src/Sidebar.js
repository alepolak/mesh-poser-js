import React from 'react';
import './Sidebar.css';
import SidebarPanel from './components/sidebar/sidebar-panel';
import ModelPanel from './components/sidebar/model-panel';
import AnimationLoader from './components/sidebar/animationLoader-panel';
import AnimationPlayer from './components/sidebar/animationPlayer-panel';

const Sidebar = (props) => {
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
                <>
                    <AnimationLoader 
                        activeIndex={props.activeIndex}
                        animationList={props.animationList}
                        onAnimationLoad={props.onAnimationLoad}
                        onAnimationSelected={props.onAnimationSelected}
                    />
                    {
                        props.hasAnimations && props.maxAnimationFrame > 0 &&
                        
                        <AnimationPlayer
                            animationFrame={props.animationFrame}
                            maxAnimationFrame={props.maxAnimationFrame}
                            onAnimationFrameChange={props.onAnimationFrameChange}
                            onPauseContinue={props.onPauseContinue}
                            singleStepMode={props.singleStepMode}
                        />
                    }
                </>
            );
        }
    };

    return(
        <div className='sidebar'>
            <ModelPanel scaleRef={props.scaleRef} onScaleChange={props.onScaleChange} onModelLoad={props.onModelLoad}/>
            {drawMenus()}
            {drawExportMenu()}
        </div>
    );
};

export default Sidebar;