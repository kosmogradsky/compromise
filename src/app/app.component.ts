import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('textLine') textLine: ElementRef<HTMLElement>;

  textState: TextState = {
    selection: new TextSelection(0, 0),
    text: 'the text',
    isEnteringText: false,
    isSelectingText: false,
  };
  commandString = '';
  cursorLeftOffset = 0;
  textStatePreview: TextState = this.textState;

  get textPieces(): { text: string }[] {
    if (this.textStatePreview.text.length === 0) {
      return [];
    }

    return [
      {
        text: this.textStatePreview.text,
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
    this.textStatePreview = this.textState;
    this.commandString = '';

    const textLineEl = this.textLine.nativeElement;
    const theLineSpanEl = textLineEl.children[1].childNodes[0];
    const range = document.createRange();
    range.setStart(theLineSpanEl, 2);
    range.setEnd(theLineSpanEl, 3);

    const rects = range.getClientRects();
    this.cursorLeftOffset =
      rects[0].left - textLineEl.getBoundingClientRect().left - 0.5;
  }

  handleCommandInput(commandString: string) {
    this.commandString = commandString;
    this.textStatePreview = this.applyCommands(this.textState);

    const textLineEl = this.textLine.nativeElement;
    const theLineSpanEl = textLineEl.children[1].childNodes[0];
    const range = document.createRange();
    range.setStart(theLineSpanEl, this.textStatePreview.selection.start);
    range.setEnd(
      theLineSpanEl,
      this.textStatePreview.selection.end === this.textStatePreview.text.length
        ? this.textStatePreview.selection.start
        : this.textStatePreview.selection.start + 1
    );

    const rects = range.getClientRects();
    this.cursorLeftOffset =
      this.textStatePreview.selection.end === this.textStatePreview.text.length
        ? rects[0].right - 8.5
        : rects[0].left - 8.5;
  }
}
