import { Component } from '@angular/core';

interface TextState {
  selection: Selection;
  isSelectingText: boolean;
  isEnteringText: boolean;
  text: string;
}

class Selection {
  constructor(public start: number, public length: number) {}

  get end() {
    return this.start + this.length;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  textState: TextState = {
    selection: new Selection(0, 0),
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
          this.textStatePreview.selection.end + 1
        ),
        highlight: true,
      },
      {
        text: this.textStatePreview.text.slice(
          this.textStatePreview.selection.end + 1
        ),
        highlight: false,
      },
    ];
  }

  get applyCommands(): (textState: TextState) => TextState {
    const commandString = this.commandString;

    return (textState) => {
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
          selection: new Selection(position, 0),
        };
      } else if (textState.isSelectingText) {
        const commandChars = commandString.split('');

        let newTextState = { ...textState };

        for (const commandChar of commandChars) {
          switch (commandChar) {
            case 'a': {
              const newSelectionStart = newTextState.selection.start - 1;
              if (newSelectionStart >= 0) {
                newTextState.selection = new Selection(
                  newSelectionStart,
                  newTextState.selection.length + 1
                );
              }
              break;
            }
            case 's': {
              const newSelectionStart = newTextState.selection.start + 1;
              if (newSelectionStart <= newTextState.selection.end) {
                newTextState.selection = new Selection(
                  newSelectionStart,
                  newTextState.selection.length - 1
                );
              }
              break;
            }
            case 'd': {
              if (newTextState.selection.length - 1 >= 0) {
                newTextState.selection = new Selection(
                  newTextState.selection.start,
                  newTextState.selection.length - 1
                );
              }
              break;
            }
            case 'f': {
              const newSelection = new Selection(
                newTextState.selection.start,
                newTextState.selection.length + 1
              );
              if (newSelection.end <= newTextState.text.length) {
                newTextState.selection = newSelection;
              }
              break;
            }
            default:
              break;
          }
        }

        newTextState.isSelectingText = false;
        return newTextState;
      } else {
        const commandChars = commandString.split('');

        let newTextState = { ...textState };

        for (const commandChar of commandChars) {
          if (commandChar === 't') {
            newTextState.isEnteringText = true;
            break;
          }

          if (commandChar === 'e') {
            newTextState.isSelectingText = true;
            break;
          }

          switch (commandChar) {
            case 'a': {
              const position = Math.max(newTextState.selection.start - 1, 0);
              newTextState.selection = new Selection(position, 0);
              break;
            }
            case 's': {
              const position = Math.min(
                newTextState.selection.end + 1,
                newTextState.text.length - 1
              );
              newTextState.selection = new Selection(position, 0);
              break;
            }
            case 'z': {
              if (newTextState.text.length === 1) {
                newTextState.text = '';
                break;
              } else {
                const position = Math.max(newTextState.selection.start - 1, 0);

                newTextState.text =
                  newTextState.text.slice(0, position) +
                  newTextState.text.slice(newTextState.selection.start);
                newTextState.selection = new Selection(position, 0);
                break;
              }
            }
            case 'x': {
              if (
                newTextState.selection.start ===
                newTextState.text.length - 1
              ) {
                newTextState.text = newTextState.text.slice(
                  0,
                  newTextState.selection.start
                );
                newTextState.selection.start -= 1;
                break;
              } else {
                const position = Math.min(
                  newTextState.selection.start + 1,
                  newTextState.text.length - 1
                );
                newTextState.text =
                  newTextState.text.slice(0, newTextState.selection.start) +
                  newTextState.text.slice(position);
                break;
              }
            }
            default:
              break;
          }
        }

        return newTextState;
      }
    };
  }

  handleCommand(event: any) {
    event.preventDefault();
    this.textState = this.applyCommands(this.textState);
    this.commandString = '';
  }
}
