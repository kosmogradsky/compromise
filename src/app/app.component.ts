import { Component } from '@angular/core';
import {
  shrinkLeftwise,
  shrinkRightwise,
  TextSelection,
  widenLeftwise,
  widenRightwise,
} from './editor-state.service';

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
          selection: new TextSelection(position, 0),
        };
      } else if (textState.isSelectingText) {
        const commandChars = commandString.split('');

        let newTextState = { ...textState };

        for (const commandChar of commandChars) {
          switch (commandChar) {
            case 'a': {
              newTextState.selection = widenLeftwise.updateSelection(
                newTextState.selection
              );
              break;
            }
            case 's': {
              newTextState.selection = shrinkLeftwise.updateSelection(
                newTextState.selection
              );
              break;
            }
            case 'd': {
              newTextState.selection = shrinkRightwise.updateSelection(
                newTextState.selection
              );
              break;
            }
            case 'f': {
              newTextState.selection = widenRightwise.updateSelection(
                newTextState.selection,
                newTextState.text.length
              );
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
              newTextState.selection = new TextSelection(position, 0);
              break;
            }
            case 's': {
              const position = Math.min(
                newTextState.selection.end + 1,
                newTextState.text.length - 1
              );
              newTextState.selection = new TextSelection(position, 0);
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
                newTextState.selection = new TextSelection(position, 0);
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
