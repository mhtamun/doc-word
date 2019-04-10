const DEFAULT_NODE = 'paragraph';

const hasBlock = (value, type) => {
    return value.blocks.some(node => node.type === type)
};

const isBlockListItemType = (value) => {
    return hasBlock(value, 'list-item');
};

const isParentBlockNumberedListType = (value) => {
    const {document} = value;
    return value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === 'numbered-list')
    });
};

const isParentBlockBulletedListType = (value) => {
    const {document} = value;
    return value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
    });
};

export const onTabPressed = (editor) => {
    const {value} = editor;

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

    if (isBlockListItemType(value) && isParentBlockNumberedListType(value) && !isLevelThree) {
        editor.wrapBlock('numbered-list');
    } else if (isBlockListItemType(value) && isParentBlockBulletedListType(value) && !isLevelThree) {
        editor.wrapBlock('bulleted-list');
    }
};

const isLevelOne = (value) => {
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

    return isLevelOne;
};

export const onShiftTabPressed = (editor) => {
    const {value} = editor;

    if (isBlockListItemType(value) && isParentBlockNumberedListType(value)) {
        if (isLevelOne(value)) {
            editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('numbered-list')
        } else {
            editor.unwrapBlock('list-item').unwrapBlock('numbered-list')
        }
    } else if (isBlockListItemType(value) && isParentBlockBulletedListType(value)) {
        if (isLevelOne(value)) {
            editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('bulleted-list')
        } else {
            editor.unwrapBlock('list-item').unwrapBlock('bulleted-list')
        }
    }
};

export const onEnterPressed = (editor) => {
    const {value} = editor;

    if (isBlockListItemType(value) && (isParentBlockNumberedListType(value) || isParentBlockBulletedListType(value))) {
        const valueAsObject = JSON.parse(JSON.stringify(value.blocks.toJSON()));
        console.log(JSON.stringify(valueAsObject[0].nodes[0].leaves[0].text));

        if (valueAsObject[0].nodes[0].leaves[0].text === '') {
            if (isBlockListItemType(value) && isParentBlockNumberedListType(value)) {
                if (isLevelOne(value)) {
                    editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('numbered-list')
                }
            } else if (isBlockListItemType(value) && isParentBlockBulletedListType(value)) {
                if (isLevelOne(value)) {
                    editor.setBlocks(DEFAULT_NODE).unwrapBlock('list-item').unwrapBlock('bulleted-list')
                }
            }
        }
    }
};

export const formatOnClick = (editor, type) => {
    const {value} = editor;
    const {document} = value;

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
        const isActive = hasBlock(value, type);
        const isList = hasBlock(value, 'list-item');

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
        const isList = hasBlock(value, 'list-item');
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
