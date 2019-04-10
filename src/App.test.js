import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import App from "./App";

it('renders without crashing', () => {
  const component = renderer.create(
      App,
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});


