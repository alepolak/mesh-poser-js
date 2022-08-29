import React from 'react';
import './Sidebar.css';
import icons from './Icons';

const Sidebar = (props) => {

    return(
        <div className='sidebar'>
                <div className='model__bar'>
                    <p className='menu__title'> MODEL </p>
                    <input className='model__load__button' type="file" accept=".fbx" onChange={props.onModelLoad} />
                    <div className='model__scale__menu'>
                        <input className='model__scale__input' ref={props.scaleRef} type="number" />
                        <button className='model__scale__update__button' onClick={props.onUpdateScale}>
                            <img src={icons.scale} alt='Scale model'/>
                        </button>
                    </div>
                </div>
                <div className='animation__bar'>
                    <p className='menu__title'> ANIMATIONS </p>
                    <input className='animation__load__button' type="file" accept=".fbx" onChange={props.onAnimationLoad} multiple/>
                    <div className='animation__buttons'>
                        {props.getAnimationButtons()}
                    </div> 
                </div>
                <div className='animation__inspector'>
                    <p className='menu__title'> FRAMES </p>
                    <div className='animation__frames'>
                        <button className='animation__toggle__button' onClick={props.onPauseContinue}>
                            <img src={icons.pause} alt='Pause animation'/>
                        </button>
                        <p className='animation__frames__data'> {props.animationFrame}/{props.maxAnimationFrame} </p>
                    </div>
                    <input className='animation__frames__slider' type="range" min="0" max={props.maxAnimationFrame} value={props.animationFrame} onChange={props.onAnimationFrameChange} step="1"/>  
                </div>
                <div className='export__bar'>     
                    <button  className='export__button' onClick={props.bake}> Bake mesh </button>
                </div>
            </div>
    );
};

export default Sidebar;