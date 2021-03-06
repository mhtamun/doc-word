import {Block} from "slate";

const schema = {
    document: {
        last: {type: 'paragraph'},
        normalize: (editor, {code, node, child}) => {
            if (code === 'last_child_type_invalid') {
                const paragraph = Block.create('paragraph');
                return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
            }
        },
    },
    blocks: {
        image: {
            isVoid: true
        },
        file: {
            isVoid: true
        },
    },
};

export default schema;
