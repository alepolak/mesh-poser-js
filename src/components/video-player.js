import React from 'react';
import './video-player.css';
import { getFormatByBrowser} from '../video-tutorial-resources';

const VideoPlayer = (props) => {
    return(
        <video className="video__player" key={props.key} autoPlay loop muted>
            <source src={props.url} type={`video/${getFormatByBrowser()}`} className='video__source'/>
        </video>
    );
};

export default VideoPlayer;