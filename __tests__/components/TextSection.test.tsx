import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import TextSection, { TextData } from '../../components/TextSection';

const mockOnTextChange = jest.fn();
const initialData: TextData = {
  text: '',
  color: '#000000',
  size: 24,
  fontWeight: 'normal',
  fontStyle: 'normal'
};

describe('TextSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('agrega texto - valida longitud máxima 50', () => {
    const { getByTestId } = render(
      <TextSection textData={initialData} onTextChange={mockOnTextChange} />
    );

    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'A'.repeat(51));

    expect(mockOnTextChange).toHaveBeenCalledWith(expect.objectContaining({
      text: 'A'.repeat(51)
    }));
  });

  it('aplica estilo color', () => {
    const { getByTestId } = render(
      <TextSection textData={initialData} onTextChange={mockOnTextChange} />
    );

    fireEvent.press(getByTestId('color-#FF0000'));
    expect(mockOnTextChange).toHaveBeenCalledWith(expect.objectContaining({
      color: '#FF0000'
    }));
  });

  it('cambia tamaño con slider', () => {
    const { getByTestId } = render(
      <TextSection textData={initialData} onTextChange={mockOnTextChange} />
    );

    const slider = getByTestId('size-slider');
    fireEvent(slider, 'onValueChange', 36);
    expect(mockOnTextChange).toHaveBeenCalledWith(expect.objectContaining({
      size: 36
    }));
  });

  it('toggle negrita', () => {
    const { getByText } = render(
      <TextSection textData={initialData} onTextChange={mockOnTextChange} />
    );

    fireEvent.press(getByText('Negrita'));
    expect(mockOnTextChange).toHaveBeenCalledWith(expect.objectContaining({
      fontWeight: 'bold'
    }));
  });

  it('toggle cursiva', () => {
    const { getByText } = render(
      <TextSection textData={initialData} onTextChange={mockOnTextChange} />
    );

    fireEvent.press(getByText('Cursiva'));
    expect(mockOnTextChange).toHaveBeenCalledWith(expect.objectContaining({
      fontStyle: 'italic'
    }));
  });
});