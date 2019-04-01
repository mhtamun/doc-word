import React, {Component, Fragment} from 'react'
import {Value} from 'slate'
import {isKeyHotkey} from 'is-hotkey'
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

import {BoldMark, CodeMark, ItalicMark, UnderlineMark} from './index'

const DEFAULT_NODE = 'paragraph';

const isTab = isKeyHotkey('tab');
const isShiftTab = isKeyHotkey('shift+tab');

// Create our initial value...
const initialValue = Value.fromJSON(
    {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "data": {},
                    "nodes": [
                        {
                            "object": "text",
                            "leaves": [
                                {
                                    "object": "leaf",
                                    "text": "A line of text in a paragraph.",
                                    "marks": []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
);

function MarkHotkey(options) {
    // Grab our options from the ones passed in.
    const {type, key} = options;

    // Return our "plugin" object, containing the `onKeyDown` handler.
    return {
        onKeyDown(event, editor, next) {
            // If it doesn't match our `key`, let other plugins handle it.
            if (!event.ctrlKey || event.key !== key) return next();

            // Prevent the default characters from being inserted.
            event.preventDefault();

            // Toggle the mark `type`.
            editor.toggleMark(type)
        },
    }
}

// Initialize a plugin for each mark...
const plugins = [
    MarkHotkey({key: 'b', type: 'bold'}),
    MarkHotkey({key: 'i', type: 'italic'}),
    MarkHotkey({key: 'u', type: 'underline'}),
    MarkHotkey({key: '`', type: 'code'}),
];

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

    hasBlock = type => {
        const {value} = this.state;
        return value.blocks.some(node => node.type === type)
    };

    // On change, update the app's React state with the new editor value.
    onChange = ({value}) => {
        console.log(JSON.stringify(value));
        this.setState({value})
    };

    onKeyDown = (event, editor, next) => {

        const {value} = editor;
        const {document} = value;

        const isBlockListItemType = this.hasBlock('list-item');

        console.log('Is block list-item type? ' + isBlockListItemType);

        const isParentBlockNumberedListType = value.blocks.some(block => {
            return !!document.getClosest(block.key, parent => parent.type === 'numbered-list')
        });

        const isParentBlockBulletedListType = value.blocks.some(block => {
            return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
        });

        console.log("Is parent block numbered-list type? " + isParentBlockNumberedListType);
        console.log("Is parent block bulleted-list type? " + isParentBlockBulletedListType);

        if (isTab(event)) {

            // console.log(value.document.nodes.toString());

            let isLevelThree = false;

            value.document.nodes.forEach(block => {
                console.log('Blocks: ');
                console.log(block['type']);
                console.log(block['key']);

                if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                    block.nodes.forEach(block => {
                        console.log('Level 1 Blocks: ');
                        console.log(block['type']);
                        console.log(block['key']);

                        isLevelThree = false;

                        if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                            block.nodes.forEach(block => {
                                console.log('Level 2 Blocks: ');
                                console.log(block['type']);
                                console.log(block['key']);

                                isLevelThree = false;

                                if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                                    console.log('Level 3 Blocks: ');
                                    console.log(block['type']);
                                    console.log(block['key']);

                                    isLevelThree = true;
                                }
                            });
                        }
                    });
                }
            });

            value.blocks.forEach(block => {
                console.log('Current cursor on: ');
                console.log(block['key']);
            });

            if (isBlockListItemType && isParentBlockNumberedListType && !isLevelThree) {
                editor.wrapBlock('numbered-list');
            } else if (isBlockListItemType && isParentBlockBulletedListType && !isLevelThree) {
                editor.wrapBlock('bulleted-list');
            }
        } else if (isShiftTab(event)) {
            let isLevelOne = false;

            value.document.nodes.forEach(block => {
                console.log('Blocks: ');
                console.log(block['type']);
                console.log(block['key']);

                if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                    block.nodes.forEach(block => {
                        console.log('Level 1 Blocks: ');
                        console.log(block['type']);
                        console.log(block['key']);

                        isLevelOne = true;

                        if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                            block.nodes.forEach(block => {
                                console.log('Level 2 Blocks: ');
                                console.log(block['type']);
                                console.log(block['key']);

                                isLevelOne = false;

                                if (block.type === 'numbered-list' || block.type === 'bulleted-list'){
                                    console.log('Level 3 Blocks: ');
                                    console.log(block['type']);
                                    console.log(block['key']);

                                    isLevelOne = false;
                                }
                            });
                        }
                    });
                }
            });
            if (isBlockListItemType && isParentBlockNumberedListType) {
                if (isLevelOne){
                    editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('numbered-list')
                } else {
                    editor.unwrapBlock('list-item').unwrapBlock('numbered-list')
                }
            } else if (isBlockListItemType && isParentBlockBulletedListType) {
                if (isLevelOne){
                    editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('bulleted-list')
                } else {
                    editor.unwrapBlock('list-item').unwrapBlock('bulleted-list')
                }
            }
        }

        return next();
    };

    onMarkClick = (event, type) => {
        event.preventDefault();

        const change = this.editor.toggleMark(type);

        this.onChange(change);
    };

    onBlockClick = (event, type) => {
        event.preventDefault();

        const {editor} = this;
        const {value} = editor;
        const {document} = value;

        // Handle everything but list buttons.
        if (type !== 'bulleted-list' && type !== 'numbered-list') {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock('list-item');

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
            const isList = this.hasBlock('list-item');
            const isType = value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === type)
            });

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

    renderMark = (props, editor, next) => {
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
                return next();
            }
        }
    };

    renderNode = (props, editor, next) => {
        const {attributes, children, node} = props;

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
                    tabIndex={-1}
                    placeholder={'Enter text here...'}
                    plugins={plugins}
                    value={this.state.value}
                    ref={this.ref}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    renderMark={this.renderMark}
                    renderNode={this.renderNode}
                />
            </Fragment>
        )
    }
}
