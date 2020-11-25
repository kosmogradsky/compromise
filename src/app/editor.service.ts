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

export interface EditorAction {
  updateState(prevState: EditorState): EditorState;
}

const widenRightwise = {
  updateSelection(
    prevSelection: TextSelection,
    textLength: number
  ): TextSelection {
    const newSelection = new TextSelection(
      prevSelection.start,
      prevSelection.length + 1
    );

    if (newSelection.end < textLength) {
      return newSelection;
    }

    return prevSelection;
  },
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      selection: this.updateSelection(
        prevState.selection,
        prevState.text.length
      ),
    };
  },
};

const shrinkRightwise = {
  updateSelection(prevSelection: TextSelection): TextSelection {
    if (prevSelection.length - 1 >= 0) {
      return new TextSelection(prevSelection.start, prevSelection.length - 1);
    }

    return prevSelection;
  },
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      selection: this.updateSelection(prevState.selection),
    };
  },
};

const goLeft = {
  goLeft(prevSelection: TextSelection): TextSelection {
    const position = Math.max(prevSelection.start - 1, 0);

    return new TextSelection(position, 0);
  },
  widenLeftwise(prevSelection: TextSelection): TextSelection {
    const newSelectionStart = prevSelection.start - 1;

    if (newSelectionStart >= 0) {
      return new TextSelection(newSelectionStart, prevSelection.length + 1);
    }

    return prevSelection;
  },
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      selection: prevState.isSelectingText
        ? this.widenLeftwise(prevState.selection)
        : this.goLeft(prevState.selection),
    };
  },
};

const goRight = {
  goRight(prevSelection: TextSelection, textLength: number): TextSelection {
    const position = Math.min(prevSelection.end + 1, textLength);

    return new TextSelection(position, 0);
  },
  shrinkLeftwise(prevSelection: TextSelection): TextSelection {
    const newSelectionStart = prevSelection.start + 1;

    if (newSelectionStart <= prevSelection.end) {
      return new TextSelection(newSelectionStart, prevSelection.length - 1);
    }

    return prevSelection;
  },
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      selection: prevState.isSelectingText
        ? this.shrinkLeftwise(prevState.selection)
        : this.goRight(prevState.selection, prevState.text.length),
    };
  },
};

const deleteSelection = {
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      text:
        prevState.text.slice(0, prevState.selection.start) +
        prevState.text.slice(prevState.selection.end),
      selection: new TextSelection(prevState.selection.start, 0),
    };
  },
};

const deleteLeftwise = {
  deleteLeftwise(prevState: EditorState): EditorState {
    if (prevState.text.length === 1) {
      return {
        ...prevState,
        text: '',
      };
    } else {
      const position = Math.max(prevState.selection.start - 1, 0);

      return {
        ...prevState,
        text:
          prevState.text.slice(0, position) +
          prevState.text.slice(prevState.selection.start),
        selection: new TextSelection(position, 0),
      };
    }
  },
  updateState(prevState: EditorState): EditorState {
    if (prevState.selection.length > 0) {
      return deleteSelection.updateState(prevState);
    }

    return this.deleteLeftwise(prevState);
  },
};

const deleteRightwise = {
  deleteRightwise(prevState: EditorState): EditorState {
    if (prevState.selection.start === prevState.text.length - 1) {
      return {
        ...prevState,
        text: prevState.text.slice(0, prevState.selection.start),
        selection: new TextSelection(prevState.selection.start - 1, 0),
      };
    } else {
      const position = Math.min(
        prevState.selection.start + 1,
        prevState.text.length - 1
      );
      return {
        ...prevState,
        text:
          prevState.text.slice(0, prevState.selection.start) +
          prevState.text.slice(position),
      };
    }
  },
  updateState(prevState: EditorState): EditorState {
    if (prevState.selection.length > 0) {
      return deleteSelection.updateState(prevState);
    }

    return this.deleteRightwise(prevState);
  },
};

const switchSelectionMode = {
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      isSelectingText: !prevState.isSelectingText,
    };
  },
};

const switchEnteringMode = {
  updateState(prevState: EditorState): EditorState {
    return {
      ...prevState,
      isEnteringText: !prevState.isEnteringText,
    };
  },
};

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private state: EditorState = {
    selection: new TextSelection(0, 0),
    text: 'the text',
    isEnteringText: false,
    isSelectingText: false,
  };

  getState(): EditorState {
    return this.state;
  }

  parseCommand(commandChar: string): EditorAction | null {
    switch (commandChar) {
      case 'a':
        return goLeft;
      case 's':
        return goRight;
      case 'd':
        return shrinkRightwise;
      case 'f':
        return widenRightwise;
      case 'z':
        return deleteLeftwise;
      case 'x':
        return deleteRightwise;
      case 'e':
        return switchSelectionMode;
      case 't':
        return switchEnteringMode;
      default:
        return null;
    }
  }

  parseCommands(commandString: string): EditorAction[] {
    const commandChars = commandString.split('');
    const actions: EditorAction[] = [];

    for (const commandChar of commandChars) {
      const action = this.parseCommand(commandChar);

      if (action !== null) {
        actions.push(action);
      }
    }

    return actions;
  }
}
