export const insertImage = (editor, src, target) => {
    if (target) {
        editor.select(target);
        console.log('Target selected');
    }

    editor.insertBlock({
        type: 'image',
        data: {src},
    }).moveFocusToEndOfDocument();
};

export const insertDocument = (editor, src, name, target) => {
    if (target) {
        editor.select(target);
        console.log('Target selected');
    }

    editor.insertBlock({
        type: 'file',
        data: {src, name},
    }).moveFocusToEndOfDocument();
};

export const insertFile = (file, editor) => {
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'];
    const validDocumentTypes = ['text/plain', 'application/pdf'];

    const reader = new FileReader();
    if (validImageTypes.includes(file.type)) {
        console.log('This is image type file.');

        reader.addEventListener('load', () => {
            editor.command(insertImage, reader.result)
        });

        reader.readAsDataURL(file)
    } else if (validDocumentTypes.includes(file.type)) {
        console.log('This is document type file.');

        reader.addEventListener('load', () => {
            editor.command(insertDocument, reader.result, file.name)
        });

        reader.readAsDataURL(file)
    } else {
        alert('Invalid file type.')
    }
};

export const downloadFile = (name, src) => {
    console.log('Download started...');
    const link = document.createElement('a');
    link.download = name;
    link.href = src.toString();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
