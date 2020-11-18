import { Component } from '@angular/core';
import { EditorService, TextSelection } from './editor.service';

interface TextState {
  selection: TextSelection;
  isSelectingText: boolean;
  isEnteringText: boolean;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  textState: TextState = {
    selection: new TextSelection(0, 0),
    text: 'the text',
    isEnteringText: false,
    isSelectingText: false,
  };
  commandString = '';

  get textStatePreview(): TextState {
    return this.applyCommands(this.textState);
  }

  get textPieces(): { text: string; highlight: boolean }[] {
    if (this.textStatePreview.text.length === 0) {
      return [];
    }

    return [
      {
        text: this.textStatePreview.text.slice(
          0,
          this.textStatePreview.selection.start
        ),
        highlight: false,
      },
      {
        text: this.textStatePreview.text.slice(
          this.textStatePreview.selection.start,
          this.textStatePreview.selection.end
        ),
        highlight: true,
      },
      {
        text: this.textStatePreview.text.slice(
          this.textStatePreview.selection.end
        ),
        highlight: false,
      },
    ];
  }

  applyCommands(textState: TextState): TextState {
    const commandString = this.commandString;

    if (textState.isEnteringText) {
      const position =
        textState.text.length === 0
          ? commandString.length
          : textState.selection.start + commandString.length;

      return {
        text:
          textState.text.slice(0, textState.selection.start) +
          commandString +
          textState.text.slice(textState.selection.end),
        isEnteringText: false,
        isSelectingText: textState.isSelectingText,
        selection: new TextSelection(position, 0),
      };
    } else {
      const actions = this.editorService.parseCommands(commandString);
      const state = actions.reduce(
        (prevState, action) => action.updateState(prevState),
        textState
      );

      return state;
    }
  }

  constructor(private editorService: EditorService) {}

  handleCommand(event: any) {
    event.preventDefault();
    this.textState = this.applyCommands(this.textState);
    this.commandString = '';
  }
}
