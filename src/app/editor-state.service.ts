import { Injectable } from '@angular/core';

export interface EditorState {
  selection: TextSelection;
  isSelectingText: boolean;
  isEnteringText: boolean;
  text: string;
}

export class TextSelection {
  constructor(public start: number, public length: number) {}

  get end() {
    return this.start + this.length;
  }
}

export const widenLeftwise = {
  updateSelection(prevSelection: TextSelection): TextSelection {
    const newSelectionStart = prevSelection.start - 1;

    if (newSelectionStart >= 0) {
      return new TextSelection(
        newSelectionStart,
        prevSelection.length + 1
      )
    }

    return prevSelection;
  }
}

export const shrinkLeftwise = {
  updateSelection(prevSelection: TextSelection): TextSelection {
    const newSelectionStart = prevSelection.start + 1;

    if (newSelectionStart <= prevSelection.end) {
      return new TextSelection(
        newSelectionStart,
        prevSelection.length - 1
      );
    }

    return prevSelection;
  }
}

export const widenRightwise = {
  updateSelection(prevSelection: TextSelection, textLength: number): TextSelection {
    const newSelection = new TextSelection(
      prevSelection.start,
      prevSelection.length + 1
    );

    if (newSelection.end <= textLength) {
      return newSelection;
    }

    return prevSelection;
  }
}

export const shrinkRightwise = {
  updateSelection(prevSelection: TextSelection): TextSelection {
    if (prevSelection.length - 1 >= 0) {
      return new TextSelection(
        prevSelection.start,
        prevSelection.length - 1
      );
    }

    return prevSelection;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  private state: EditorState = {
    selection: new TextSelection(0, 0),
    text: 'the text',
    isEnteringText: false,
    isSelectingText: false,
  };

  getState(): EditorState {
    return this.state;
  }

  goLeft() {
    
  }
}
