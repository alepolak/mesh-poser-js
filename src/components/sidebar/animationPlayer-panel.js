import react from 'react';
import './animationPlayer-panel.css';
import SidebarPanel from './sidebar-panel';
import icons from '../../Icons';

const AnimationPlayer = (props) => {

    const getPlayPuseIcon = () => {
        return props.singleStepMode ? icons.play : icons.pause;
    }

    return (
        <SidebarPanel title="FRAMES">
            <div className='frames'>
                <button className='toggle__button' onClick={props.onPauseContinue}>
                    <img src={getPlayPuseIcon()} alt='Pause animation'/>
                </button>
                <p className='frames__data'> {props.animationFrame}/{props.maxAnimationFrame} </p>
            </div>
            <input className='frames__slider' type="range" min="0" max={props.maxAnimationFrame} value={props.animationFrame} onChange={props.onAnimationFrameChange} step="1"/>  
        </SidebarPanel>
    );
};

export default AnimationPlayer;