import React, {Component, Fragment} from 'react'
import {Block, Value} from 'slate'
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
import {image} from 'react-icons-kit/fa/image'
import {upload} from 'react-icons-kit/fa/upload'
import {Editor} from 'slate-react'
import Image from './Image'

import {BoldMark, CodeMark, ItalicMark, UnderlineMark} from './index'

const DEFAULT_NODE = 'paragraph';

const isTab = isKeyHotkey('tab');
const isShiftTab = isKeyHotkey('shift+tab');

// Create our initial value...
const initialValue = Value.fromJSON(
    {
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
                                    "text":
                                        "In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos."
                                }
                            ]
                        }
                    ]
                },
                {
                    "object": "block",
                    "type": "image",
                    "data": {
                        "src":
                            "https://img.washingtonpost.com/wp-apps/imrs.php?src=https://img.washingtonpost.com/news/speaking-of-science/wp-content/uploads/sites/36/2015/10/as12-49-7278-1024x1024.jpg&w=1484"
                    }
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
                                        "This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your keyboard and paste it anywhere in the editor!"
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

const schema = {
    document: {
        last: {type: 'paragraph'},
        normalize: (editor, {code, node, child}) => {
            switch (code) {
                case 'last_child_type_invalid': {
                    const paragraph = Block.create('paragraph');
                    return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
                }
            }
        },
    },
    blocks: {
        image: {
            isVoid: true
        }
    }
};

const insertImage = (editor, src, target) => {
    if (target) {
        editor.select(target)
    }

    editor.insertBlock({
        type: 'image',
        data: {src},
    });
};

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

                if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
                    block.nodes.forEach(block => {
                        console.log('Level 1 Blocks: ');
                        console.log(block['type']);
                        console.log(block['key']);

                        isLevelThree = false;

                        if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
                            block.nodes.forEach(block => {
                                console.log('Level 2 Blocks: ');
                                console.log(block['type']);
                                console.log(block['key']);

                                isLevelThree = false;

                                if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
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

                if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
                    block.nodes.forEach(block => {
                        console.log('Level 1 Blocks: ');
                        console.log(block['type']);
                        console.log(block['key']);

                        isLevelOne = true;

                        if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
                            block.nodes.forEach(block => {
                                console.log('Level 2 Blocks: ');
                                console.log(block['type']);
                                console.log(block['key']);

                                isLevelOne = false;

                                if (block.type === 'numbered-list' || block.type === 'bulleted-list') {
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
                if (isLevelOne) {
                    editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('numbered-list')
                } else {
                    editor.unwrapBlock('list-item').unwrapBlock('numbered-list')
                }
            } else if (isBlockListItemType && isParentBlockBulletedListType) {
                if (isLevelOne) {
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
        const {attributes, children, node, isFocused} = props;

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
            case 'image':
                const src = node.data.get('src');
                return <Image src={src} selected={isFocused} {...attributes} />;
            default:
                return next();
        }
    };

    onImageClick = event => {
        event.preventDefault();
        const src = window.prompt('Enter the URL of the image:');
        if (!src) return;
        this.editor.command(insertImage, src)
    };

    onFileSelect = event => {
        event.preventDefault();

        let file;
        try {
            file = event.target.files[0];
            console.log(file);

            const validImageTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'];
            if (validImageTypes.includes(file.type)) {
                console.log('This is image type file.');

                const reader = new FileReader();
                const [mime] = file.type.split('/');
                if (mime === 'image') {

                    reader.addEventListener('load', () => {
                        this.editor.command(insertImage, reader.result)
                    });

                    reader.readAsDataURL(file)
                }
            }
        } catch (error) {
            console.log(error);
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
                    <button className="button" onPointerDown={(event) => this.onImageClick(event)}>
                        <Icon icon={image}/>
                    </button>
                    <input className="button" type="file" onChange={(event) => this.onFileSelect(event)}/>

                </Toolbar>
                <Editor
                    spellCheck
                    autoFocus
                    tabIndex={-1}
                    placeholder={'Enter text here...'}
                    plugins={plugins}
                    schema={schema}
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
