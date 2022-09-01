import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import icons from './Icons';
import FileButton from './FileButton';

const Sidebar = (props) => {

    const drawScaleMenu = () => {
        return (
            <div className='model__scale__menu'>
                <p className='model__scale__label'>Scale:</p>
                <input className='model__scale__input' ref={props.scaleRef} onChange={props.onScaleChange} type="number" />
                <button className='model__scale__update__button' onClick={props.onUpdateScale}>
                    <img src={icons.scale} alt='Scale model'/>
                </button>
            </div>
        );
    };

    /**
     *  Animation Menu
     * 
     */
    const drawAnimationMenu = () => {
        if(props.modelReady) {
            return (
                <div className='animation__bar'>
                    <p className='menu__title'> ANIMATIONS </p>
                    <FileButton
                        buttonLabel="Load animations"
                        onModelLoad={props.onAnimationLoad}
                        isMultiple={true}
                    />
                    <form className='animation__radios'>
                        {props.getAnimationButtons()}
                    </form> 
                </div>
            );
        }
    };

    /**
     *  Animation Player Menu
     * 
     */
    const drawAnimationPlayerMenu = () => {
        if(props.hasAnimations) {
            return (
                <div className='animation__player__bar'>
                    <p className='menu__title'> FRAMES </p>
                    <div className='animation__frames'>
                        <button className='animation__toggle__button' onClick={props.onPauseContinue}>
                            <img src={getPlayPuseIcon()} alt='Pause animation'/>
                        </button>
                        <p className='animation__frames__data'> {props.animationFrame}/{props.maxAnimationFrame} </p>
                    </div>
                    <input className='animation__frames__slider' type="range" min="0" max={props.maxAnimationFrame} value={props.animationFrame} onChange={props.onAnimationFrameChange} step="1"/>  
                </div>
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
                <div className='export__bar'>     
                    <button  className='export__button' onClick={props.bake}> Bake mesh </button>
                </div>
            );
        }
    };

    return(
        <div className='sidebar'>
            <div className='model__bar'>
                <p className='menu__title'> MODEL </p>
                <FileButton 
                    buttonLabel="Load model"
                    onModelLoad={props.onModelLoad}
                    isMultiple={false}
                />
                {drawScaleMenu()}
            </div>
            {drawAnimationMenu()}
            {drawAnimationPlayerMenu()}
            {drawExportMenu()}
        </div>
    );
};

export default Sidebar;