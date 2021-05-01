import { Strings } from 'tsbase/Functions/Strings';
import { RecursiveReRender } from '../recursiveReRender';

describe('RecursiveReRender', () => {
  const oldElement = document.createElement('div');
  const newElement = document.createElement('div');

  beforeEach(() => {
    oldElement.innerHTML = Strings.Empty;
    newElement.innerHTML = Strings.Empty;
  });

  it('should exit without updating when there are no changes', () => {
    const content = '<p>test</p>';
    oldElement.innerHTML = content;
    newElement.innerHTML = content;

    const result = RecursiveReRender(oldElement, newElement);

    expect(result.IsSuccess).toBeTruthy();
  });

  it('should update the old element\'s inner html at the top level when there are changes and no children', () => {
    oldElement.innerHTML = 'one';
    newElement.innerHTML = 'two';

    const result = RecursiveReRender(oldElement, newElement);

    expect(result.IsSuccess).toBeTruthy();
    expect(oldElement.innerHTML).toEqual('two');
  });

  it('should update the old element\'s children when a change is found', () => {
    oldElement.innerHTML = '<p>one</p>';
    newElement.innerHTML = '<p>two</p>';

    const result = RecursiveReRender(oldElement, newElement);

    expect(result.IsSuccess).toBeTruthy();
    expect(oldElement.innerHTML).toEqual('<p>two</p>');
  });

  it('should update the old element\'s children when a change is found n levels deep', () => {
    oldElement.innerHTML = '<div><div><div><div><div>one</div></div></div></div></div>';
    newElement.innerHTML = '<div><div><div><div><div>two</div></div></div></div></div>';

    const result = RecursiveReRender(oldElement, newElement);

    expect(result.IsSuccess).toBeTruthy();
    expect(oldElement.innerHTML).toEqual('<div><div><div><div><div>two</div></div></div></div></div>');
  });

  it('should update the parent\'s inner html of a child incompatible with it revision', () => {
    oldElement.innerHTML = '<p>one</p>';
    newElement.innerHTML = '<div>two</div>';

    const result = RecursiveReRender(oldElement, newElement);

    expect(result.IsSuccess).toBeTruthy();
    expect(oldElement.innerHTML).toEqual('<div>two</div>');
  });
});
