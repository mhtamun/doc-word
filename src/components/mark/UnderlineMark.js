import React from 'react'

const ItalicMark = props => (
    <u property="underline">
        {props.children}
    </u>
);

export default ItalicMark;
