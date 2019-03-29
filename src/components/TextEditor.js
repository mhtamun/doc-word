import React, {Component, Fragment} from 'react'
import {Value} from 'slate'
import 'react-bootstrap/dist/react-bootstrap';

import Toolbar from './Toolbar'
import Icon from 'react-icons-kit'
import {bold} from 'react-icons-kit/feather/bold'
import {italic} from 'react-icons-kit/feather/italic'
import {underline} from 'react-icons-kit/feather/underline'
import {code} from 'react-icons-kit/feather/code'
import {arrowUp} from 'react-icons-kit/metrize/arrowUp'
import {arrowDown} from 'react-icons-kit/metrize/arrowDown'
import {quote} from 'react-icons-kit/metrize/quote'
import {listOl} from 'react-icons-kit/fa/listOl'
import {listUl} from 'react-icons-kit/fa/listUl'
import {Editor} from 'slate-react'

import {BoldMark, ItalicMark, UnderlineMark, CodeMark} from './index'

// Create our initial value...
const initialValue = Value.fromJSON({
    "document": {
        "nodes": [
            {
                "object": "block",
                "type": "paragraph",
                "nodes": [
                    {
                        "object": "text",
                        "leaves": [
                            {
                                "text": "This is editable "
                            },
                            {
                                "text": "rich",
                                "marks": [
                                    {
                                        "type": "bold"
                                    }
                                ]
                            },
                            {
                                "text": " text, "
                            },
                            {
                                "text": "much",
                                "marks": [
                                    {
                                        "type": "italic"
                                    }
                                ]
                            },
                            {
                                "text": " better than a "
                            },
                            {
                                "text": "<textarea>",
                                "marks": [
                                    {
                                        "type": "code"
                                    }
                                ]
                            },
                            {
                                "text": "!"
                            }
                        ]
                    }
                ]
            },
            {
                "object": "block",
                "type": "paragraph",
                "nodes": [
                    {
                        "object": "text",
                        "leaves": [
                            {
                                "text":
                                    "Since it's rich text, you can do things like turn a selection of text "
                            },
                            {
                                "text": "bold",
                                "marks": [
                                    {
                                        "type": "bold"
                                    }
                                ]
                            },
                            {
                                "text":
                                    ", or add a semantically rendered block quote in the middle of the page, like this:"
                            }
                        ]
                    }
                ]
            },
            {
                "object": "block",
                "type": "block-quote",
                "nodes": [
                    {
                        "object": "text",
                        "leaves": [
                            {
                                "text": "A wise quote."
                            }
                        ]
                    }
                ]
            },
            {
                "object": "block",
                "type": "paragraph",
                "nodes": [
                    {
                        "object": "text",
                        "leaves": [
                            {
                                "text": "Try it out for yourself!"
                            }
                        ]
                    }
                ]
            }
        ]
    }
});


export default class TextEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            value: initialValue,
        };
    }

    ref = editor => {
        this.editor = editor
    };

    // On change, update the app's React state with the new editor value.
    onChange = ({value}) => {
        this.setState({value})
    };

    onMarkClick = (event, type) => {
        event.preventDefault();

        const change = this.editor.toggleMark(type);

        this.onChange(change);
    };

    onBlockClick = (event, type) => {
        event.preventDefault()

        const { editor } = this
        const { value } = editor
        const { document } = value

        // Handle everything but list buttons.
        if (type !== 'bulleted-list' && type !== 'numbered-list') {
            const isActive = this.hasBlock(type)
            const isList = this.hasBlock('list-item')

            if (isList) {
                editor
                    .setBlocks(isActive ? DEFAULT_NODE : type)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list')
            } else {
                editor.setBlocks(isActive ? DEFAULT_NODE : type)
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            const isList = this.hasBlock('list-item')
            const isType = value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === type)
            })

            if (isList && isType) {
                editor
                    .setBlocks(DEFAULT_NODE)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list')
            } else if (isList) {
                editor
                    .unwrapBlock(
                        type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
                    )
                    .wrapBlock(type)
            } else {
                editor.setBlocks('list-item').wrapBlock(type)
            }
        }
    };

    renderMark = props => {
        switch (props.mark.type) {
            case 'bold':
                return <BoldMark {...props} />;

            case 'italic':
                return <ItalicMark {...props} />;

            case 'underline':
                return <UnderlineMark {...props} />;

            case 'code':
                return <CodeMark {...props} />;

            default: {
                return;
            }
        }
    };

    renderNode = (props, editor, next) => {
        const { attributes, children, node } = props;

        switch (node.type) {
            case 'block-quote':
                return <blockquote {...attributes}>{children}</blockquote>;
            case 'bulleted-list':
                return <ul {...attributes}>{children}</ul>;
            case 'heading-one':
                return <h1 {...attributes}>{children}</h1>;
            case 'heading-two':
                return <h2 {...attributes}>{children}</h2>;
            case 'list-item':
                return <li {...attributes}>{children}</li>;
            case 'numbered-list':
                return <ol {...attributes}>{children}</ol>;
            default:
                return next()
        }
    };

    render() {
        return (
            <Fragment>
                <Toolbar>
                    <button className="button" onPointerDown={(event) => this.onMarkClick(event, 'bold')}>
                        <Icon icon={bold}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onMarkClick(event, 'italic')}>
                        <Icon icon={italic}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onMarkClick(event, 'underline')}>
                        <Icon icon={underline}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onMarkClick(event, 'code')}>
                        <Icon icon={code}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'heading-one')}>
                        <Icon icon={arrowUp}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'heading-two')}>
                        <Icon icon={arrowDown}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'block-quote')}>
                        <Icon icon={quote}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'numbered-list')}>
                        <Icon icon={listOl}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'bulleted-list')}>
                        <Icon icon={listUl}/>
                    </button>
                </Toolbar>
                <Editor
                    spellCheck
                    autoFocus
                    placeholder={'Enter text here...'}
                    value={this.state.value}
                    ref={this.ref}
                    onChange={this.onChange}
                    //onKeyDown={this.onKeyDown}
                    renderMark={this.renderMark}
                />
            </Fragment>
        )
    }
}
