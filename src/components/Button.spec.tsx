import { render } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('Button should be created and match snapshot', () => {
    const fixture = render(<Button name="crazyButton">Click me</Button>);

    expect(fixture.container).toMatchSnapshot();
  });
});
