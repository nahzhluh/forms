import { render, screen } from '@testing-library/react';
import App from './App';

test('renders project dashboard', () => {
  render(<App />);
  const headingElement = screen.getByText(/Your Projects/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders new project button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/\+ New Project/i);
  expect(buttonElement).toBeInTheDocument();
});
