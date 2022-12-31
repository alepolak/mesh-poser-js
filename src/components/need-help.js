import React from 'react';
import './need-help.css';

const NeedHelp = (props) => {
    return (
        <p onClick={props.openModal} className="need__help"> Need help? </p>
    );
};

export default NeedHelp;

//<a href='https://github.com/alepolak/mesh-poser-js#examples' target={"_blank"} rel="noreferrer noopener">Need help?</a>