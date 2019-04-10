import React, {Component, Fragment} from 'react'
import {Value} from 'slate'
import {Editor} from 'slate-react'
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
import {ic_looks_one} from 'react-icons-kit/md/ic_looks_one'
import {ic_looks_two} from 'react-icons-kit/md/ic_looks_two'
import {quote} from 'react-icons-kit/metrize/quote'
import {listOl} from 'react-icons-kit/fa/listOl'
import {listUl} from 'react-icons-kit/fa/listUl'
import {image} from 'react-icons-kit/fa/image'
import {fileImageO} from 'react-icons-kit/fa/fileImageO'
import {file} from 'react-icons-kit/fa/file'
import Image from './Image'

import {BoldMark, CodeMark, ItalicMark, UnderlineMark} from './index'

import schema from "../schema"
import {downloadFile, insertFile, insertImage} from "../lib/file";
import {formatOnClick, onEnterPressed, onShiftTabPressed, onTabPressed} from "../lib/text";

const isTab = isKeyHotkey('tab');
const isShiftTab = isKeyHotkey('shift+tab');
const isEnter = isKeyHotkey('return');

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

function save(value, topLevelBlockLimit) {
    if (typeof (Storage) !== "undefined") {
        // Save the value to Local Storage.
        const content = JSON.stringify(value.toJSON());
        console.log('Content ', content);

        const contentObject = JSON.parse(content);

        if (contentObject.document.nodes.length > topLevelBlockLimit && topLevelBlockLimit != '0') {
            alert('Can not save due crossed the limit of blocks \nYou set the limit is ' + topLevelBlockLimit);
            return;
        }

        localStorage.setItem('content', content)
    } else {
        console.log('Sorry, your browser does not support Web Storage...')
    }
}

export default class TextEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            value: initialValue,
            topLevelBlockLimit: 0,
        };

        this.inputImageFile = React.createRef();
        this.inputFile = React.createRef();
    }

    onDocumentFileClick = (event, name, src) => {
        event.preventDefault();

        confirmAlert({
            title: 'Are you sure?',
            message: 'Want to download ' + name,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        downloadFile(name, src)
                    }
                },
                {
                    label: 'No',
                }
            ]
        });
    };

    onChangeInputOfTopLevelBlockLimit = event => {
        this.setState({
            topLevelBlockLimit: event.target.value
        });
    };

    onSaveClick = (event) => {
        event.preventDefault();

        save(this.state.value, this.state.topLevelBlockLimit);
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

        formatOnClick(editor, type)
    };

    onImageClick = event => {
        event.preventDefault();

        const src = window.prompt('Enter the URL of the image:');

        if (!src) return;

        this.editor.command(insertImage, src);
    };

    onOpenImage = event => {
        event.preventDefault();

        this.inputImageFile.current.click();
    };
    onOpenFile = event => {
        event.preventDefault();

        this.inputFile.current.click();
    };

    onFileSelect = event => {
        event.preventDefault();

        const file = event.target.files[0];

        insertFile(file, this.editor);
    };

    ref = editor => {
        this.editor = editor;
    };

    // On change, update the app's React state with the new editor value.
    onChange = ({value}) => {
        console.log('onChange value: ', JSON.stringify(value.toJSON()));
        console.log('onChange current cursor on: ', JSON.stringify(value.blocks.toJSON()));

        this.setState({value});
    };

    onKeyDown = (event, editor, next) => {
        if (isTab(event)) {
            onTabPressed(editor);

            event.preventDefault();
        } else if (isShiftTab(event)) {
            onShiftTabPressed(editor);

            event.preventDefault();
        } else if (isEnter(event)) {
            onEnterPressed(editor);

            event.preventDefault();
        }

        return next();
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
            case 'heading-one':
                return <h1 {...attributes}>{children}</h1>;
            case 'heading-two':
                return <h2 {...attributes}>{children}</h2>;
            case 'block-quote':
                return <blockquote {...attributes}>{children}</blockquote>;
            case 'list-item':
                return <li {...attributes}>{children}</li>;
            case 'numbered-list':
                return <ol {...attributes}>{children}</ol>;
            case 'bulleted-list':
                return <ul {...attributes}>{children}</ul>;
            case 'image':
                const imageSrc = node.data.get('src');
                return <Image src={imageSrc} selected={isFocused} alt=""
                              className="image-node"/>;
            case 'file':
                const documentSrc = node.data.get('src');
                const name = node.data.get('name');
                return <a download={name} href={documentSrc}>
                        <span onClick={(event) => this.onDocumentFileClick(event, name, documentSrc)}>
                            <Icon icon={file}/> {name}
                        </span>
                </a>;
            default:
                return next();
        }
    };

    render() {
        const content = JSON.stringify(this.state.value.toJSON());
        const contentObject = JSON.parse(content);
        return (
            <Fragment>
                <Toolbar>
                    <span>Enter the limit of blocks </span>
                    <input name={"topLevelBlockLimit"}
                           type={"number"}
                           value={this.state.topLevelBlockLimit === 0 ? 0 : this.state.topLevelBlockLimit}
                           onChange={this.onChangeInputOfTopLevelBlockLimit}/>
                </Toolbar>
                <Toolbar>
                    <button className="button"
                            disabled={contentObject.document.nodes.length > this.state.topLevelBlockLimit && this.state.topLevelBlockLimit != 0}
                            onPointerDown={(event) => this.onSaveClick(event)}>
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
                        <Icon icon={ic_looks_one}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'heading-two')}>
                        <Icon icon={ic_looks_two}/>
                    </button>
                    {/*<button className="button" onPointerDown={(event) => this.onBlockClick(event, 'block-quote')}>*/}
                        {/*<Icon icon={quote}/>*/}
                    {/*</button>*/}
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'numbered-list')}>
                        <Icon icon={listOl}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onBlockClick(event, 'bulleted-list')}>
                        <Icon icon={listUl}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onImageClick(event)}>
                        <Icon icon={image}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onOpenImage(event)}>
                        <Icon icon={fileImageO}/>
                    </button>
                    <button className="button" onPointerDown={(event) => this.onOpenFile(event)}>
                        <Icon icon={file}/>
                    </button>
                </Toolbar>
                <div>
                    <input
                        ref={this.inputImageFile}
                        type="file"
                        style={{display: 'none'}}
                        onChange={this.onFileSelect}
                        accept="image/*"
                    />
                    <input
                        ref={this.inputFile}
                        type="file"
                        style={{display: 'none'}}
                        onChange={this.onFileSelect}
                        accept="application/pdf,text/plain"
                    />
                </div>
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
        this.editor.focus();
    }
}
