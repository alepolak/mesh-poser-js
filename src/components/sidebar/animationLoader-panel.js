import react from 'react';
import './animationLoader-panel.css';
import FileButton from '../../FileButton';
import SidebarPanel from './sidebar-panel';

const AnimationLoader = (props) => {
    
     /** Get Animation buttons
     * 
     * Create a radio button per every animation loaded.
     * @returns a list of animation radio buttons.
     */
    const getAnimationButtons = () => {
        return props.animationList.map( (animation, i) => {
            if(i === 0) {
                return "";
            } else {
                return (
                    <label className='radio__item' key={i}>
                        <input type="radio" value="option1" onChange={() => {props.onAnimationSelected(i)}} checked={props.activeIndex === i} />
                        <p className='animation__name'> Animation {i} </p>
                    </label>
                );
            }
        });  
    };

    return (
        <SidebarPanel title="ANIMATIONS">
            <FileButton
                buttonLabel="Load animations"
                onModelLoad={props.onAnimationLoad}
                isMultiple={true}
            />
            <form className='radios'>
                {getAnimationButtons()}
            </form> 
        </SidebarPanel>
    );
};

export default AnimationLoader;