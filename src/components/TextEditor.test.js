import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import TextEditor from "./TextEditor";

it('renders without crashing', () => {
    const component = renderer.create(
        TextEditor,
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});


