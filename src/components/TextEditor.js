import React, {Component, Fragment} from 'react'
import {Block, Value} from 'slate'
import {isKeyHotkey} from 'is-hotkey'
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
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
import {file} from 'react-icons-kit/fa/file'
import {Editor} from 'slate-react'
import Image from './Image'

import {BoldMark, CodeMark, ItalicMark, UnderlineMark} from './index'

const DEFAULT_NODE = 'paragraph';

const isTab = isKeyHotkey('tab');
const isShiftTab = isKeyHotkey('shift+tab');

// Update the initial content to be pulled from Local Storage if it exists.
const existingValue = JSON.parse(localStorage.getItem('content'));
// Create our initial value...
const initialValue = Value.fromJSON(
    existingValue || {
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
                                        ""
                                }
                            ]
                        }
                    ]
                },
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
    },
};

const insertImage = (editor, src, target) => {
    if (target) {
        editor.select(target)
    }

    editor.insertBlock({
        type: 'image',
        data: {src},
    });

    editor.focus();
};

const insertDocument = (editor, src, name, target) => {
    if (target) {
        editor.select(target)
    }

    editor.insertBlock({
        type: 'document-file',
        data: {src, name},
    });
};

export default class TextEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            value: initialValue,
            topLevelBlockLimit: 0,
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
    onChangeInputOfTopLevelBlockLimit = event => {
        console.log(event.target.name, event.target.value);
        this.setState({
            topLevelBlockLimit: event.target.value
        });
    };

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

            event.preventDefault();
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

            event.preventDefault();
        }

        return next();
    };

    onSaveClick = (event) => {
        event.preventDefault();

        console.log('onSaveClick');

        if (typeof (Storage) !== "undefined") {
            // Save the value to Local Storage.
            const content = JSON.stringify(this.state.value.toJSON());
            console.log('Content ', content);

            const contentObject = JSON.parse(content);

            if (contentObject.document.nodes.length > this.state.topLevelBlockLimit && this.state.topLevelBlockLimit != 0){
                alert('Can not save due crossed the limit of blocks \nYou set the limit is ' + this.state.topLevelBlockLimit)
                return;
            }

            localStorage.setItem('content', content)
        } else {
            console.log('Sorry, your browser does not support Web Storage...')
        }
    };

    onCancelClick = (event) => {
        event.preventDefault();

        this.setState({value: initialValue})
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

    onImageClick = event => {
        event.preventDefault();
        const src = window.prompt('Enter the URL of the image:');
        if (!src) return;
        this.editor.command(insertImage, src)
    };

    onFileSelect = event => {
        event.preventDefault();

        const file = event.target.files[0];
        console.log('File ', file);

        const validImageTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'];
        const validDocumentTypes = ['text/plain', 'application/pdf'];

        const reader = new FileReader();

        if (validImageTypes.includes(file.type)) {
            console.log('This is image type file.');

            reader.addEventListener('load', () => {
                this.editor.command(insertImage, reader.result)
            });

            reader.readAsDataURL(file)
        } else if (validDocumentTypes.includes(file.type)) {
            console.log('This is document type file.');

            reader.addEventListener('load', () => {
                this.editor.command(insertDocument, reader.result, file.name)
            });

            reader.readAsDataURL(file)
        } else {
            alert('Invalid file type.')
        }
    };

    onDocumentFileClick = (event, name, src) => {
        event.preventDefault();
        confirmAlert({
            title: 'Are you sure?',
            message: 'Want to download ' + name,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        console.log('Download started...');
                        const link = document.createElement('a');
                        link.download = name;
                        link.href = src.toString();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                },
                {
                    label: 'No',
                }
            ]
        });
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
            case 'heading-one':
                return <h1 {...attributes}>{children}</h1>;
            case 'heading-two':
                return <h2 {...attributes}>{children}</h2>;
            case 'list-item':
                return <li {...attributes}>{children}</li>;
            case 'numbered-list':
                return <ol {...attributes}>{children}</ol>;
            case 'bulleted-list':
                return <ul {...attributes}>{children}</ul>;
            case 'image':
                const imageSrc = node.data.get('src');
                return <Image src={imageSrc} selected={isFocused} {...attributes} />;
            case 'document-file':
                const documentSrc = node.data.get('src');
                const name = node.data.get('name');
                return <span onClick={(event) => this.onDocumentFileClick(event, name, documentSrc)}><Icon
                    icon={file}/>{name}</span>;
            default:
                return next();
        }
    };

    render() {
        return (
            <Fragment>
                <Toolbar>
                    <span>Enter the limit of blocks </span>
                    <input name={"topLevelBlockLimit"}
                           type={"number"}
                           value={ this.state.topLevelBlockLimit === 0 ? 0 : this.state.topLevelBlockLimit}
                           onChange={this.onChangeInputOfTopLevelBlockLimit} />
                </Toolbar>
                <Toolbar>
                    <button className="button" onPointerDown={(event) => this.onSaveClick(event)}>
                        Save
                    </button>
                    <button className="button" onPointerDown={(event) => this.onCancelClick(event)}>
                        Cancel
                    </button>
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

    componentDidMount() {

    }
}
