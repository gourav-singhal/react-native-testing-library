// @flow
import * as React from 'react';
import { isValidElementType } from 'react-is';
import TestRenderer from 'react-test-renderer'; // eslint-disable-line import/no-extraneous-dependencies
import ShallowRenderer from 'react-test-renderer/shallow'; // eslint-disable-line import/no-extraneous-dependencies
import prettyFormat, { plugins } from 'pretty-format'; // eslint-disable-line import/no-extraneous-dependencies

const getNodeByName = (node, name) =>
  node.type.name === name ||
  node.type.displayName === name ||
  node.type === name;

const getNodeByText = (node, text) =>
  (getNodeByName(node, 'Text') || getNodeByName(node, 'TextInput')) &&
  (typeof text === 'string'
    ? text === node.props.children
    : text.test(node.props.children));

/**
 * Wait for microtask queue to flush
 */
export const flushMicrotasksQueue = (): Promise<any> =>
  new Promise(resolve => setImmediate(resolve));

/**
 * Renders test component deeply using react-test-renderer and exposes helpers
 * to assert on the output.
 */
export const render = (component: React.Element<*>) => {
  const renderer = TestRenderer.create(component);
  const instance = renderer.root;

  return {
    instance,
    renderer,
    getByTestId: (testID: string) => instance.findByProps({ testID }),
    getByName: (name: string) =>
      instance.find(node => getNodeByName(node, name)),
    getAllByName: (name: string) =>
      instance.findAll(node => getNodeByName(node, name)),
    getByText: (text: string | RegExp) =>
      instance.find(node => getNodeByText(node, text)),
    getAllByText: (text: string | RegExp) =>
      instance.findAll(node => getNodeByText(node, text)),
    getByProps: (props: { [propName: string]: any }) =>
      instance.findByProps(props),
    getAllByProps: (props: { [propName: string]: any }) =>
      instance.findAllByProps(props),
  };
};

/**
 * Renders test component shallowly using react-test-renderer/shallow
 */
export const shallow = (instance: ReactTestInstance | React.Element<*>) => {
  const renderer = new ShallowRenderer();
  if (isValidElementType(instance)) {
    // $FlowFixMe - instance is React.Element<*> in this branch
    renderer.render(instance);
  } else {
    renderer.render(React.createElement(instance.type, instance.props));
  }
  const result = renderer.getRenderOutput();

  return result;
};

/**
 * Log pretty-printed shallow test component instance
 */
export const debug = (
  instance: ReactTestInstance | React.Element<*>,
  message?: any
) => {
  // eslint-disable-next-line no-console
  console.log(
    prettyFormat(shallow(instance), {
      plugins: [plugins.ReactTestComponent, plugins.ReactElement],
    }),
    message
  );
};