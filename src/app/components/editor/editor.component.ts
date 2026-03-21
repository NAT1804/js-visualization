import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BaseComponent } from '../base/base.component';
import { ButtonComponent } from '../common/button.component';

declare const monaco: any;

@Component({
  selector: 'app-editor',
  imports: [MonacoEditorModule, FormsModule, ButtonComponent],
  template: `
    <ngx-monaco-editor
      [options]="editorOptions()"
      (onInit)="onInit($event)"
      [(ngModel)]="code"
    ></ngx-monaco-editor>
    <div class="flex gap-2 self-end">
      <app-button
        [disabled]="visualizerStore.isComputing() || visualizerStore.isPlayingVisualizer()"
        (click)="saveCode()"
        >Save Code</app-button
      >
      <app-button
        [disabled]="visualizerStore.isComputing() || visualizerStore.isPlayingVisualizer()"
        [loading]="visualizerStore.isComputing()"
        (click)="executeCode()"
      >
        Execute Code
      </app-button>
      <app-button
        [disabled]="!visualizerStore.isExecuted() || visualizerStore.isComputing()"
        [loading]="visualizerStore.isPlayingVisualizer()"
        (click)="playSimulation()"
        >Play Simulation</app-button
      >
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoEditorComponent extends BaseComponent implements OnInit {
  editorOptions = input<any>({
    glyphMargin: true,
    lineNumbers: 'off',
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  });
  onlyViewMode = input<boolean>(false);
  executeCodeEvent = output<void>();
  playSimulationEvent = output<void>();

  code = model<string>('');
  editorInstance = signal<any>(null);
  currentDecorations = signal<string[]>([]);

  constructor() {
    super();
    effect(() => {
      const currentHighlightBlock = this.visualizerStore.currentHighlightBlock();
      const editor = this.editorInstance();
      if (currentHighlightBlock && editor && typeof monaco !== 'undefined') {
        this.highlightBlock(currentHighlightBlock);
      }
    });
  }

  ngOnInit(): void {
    const savedCode = localStorage.getItem('code');
    if (savedCode) {
      this.code.set(savedCode);
    }
  }

  onInit(editor: any) {
    this.editorInstance.set(editor);
  }

  highlightLine(lineNumber: number) {
    const editor = this.editorInstance();
    const decorations = this.currentDecorations();

    if (!editor) return;

    this.currentDecorations.set(
      editor.deltaDecorations(decorations, [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'highlight-current-line',
            glyphMarginClassName: 'highlight-glyph',
          },
        },
      ]),
    );
  }

  highlightBlock(codeBlock: string) {
    const editor = this.editorInstance();
    const decorations = this.currentDecorations();
    if (!editor || typeof monaco === 'undefined' || !codeBlock) return;

    const model = editor.getModel();
    const fullCode = model.getValue();

    const startIndex = fullCode.indexOf(codeBlock);

    if (startIndex === -1) {
      return;
    }

    const endIndex = startIndex + codeBlock.length;

    const startPos = model.getPositionAt(startIndex);
    const endPos = model.getPositionAt(endIndex);

    this.currentDecorations.set(
      editor.deltaDecorations(decorations, [
        {
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            endPos.lineNumber,
            endPos.column,
          ),
          options: {
            inlineClassName: 'highlight-code-block',
            isWholeLine: false,
          },
        },
      ]),
    );
  }

  clearHighlight() {
    const editor = this.editorInstance();
    const decorations = this.currentDecorations();
    if (editor) {
      this.currentDecorations.set(editor.deltaDecorations(decorations, []));
    }
  }

  saveCode() {
    localStorage.setItem('code', this.code());
  }

  executeCode() {
    this.executeCodeEvent.emit();
  }

  playSimulation() {
    this.playSimulationEvent.emit();
  }
}
