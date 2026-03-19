import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorComponent, MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import { ButtonComponent } from '../common/button.component';
import { BaseComponent } from '../base/base.component';

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
      <app-button (click)="saveCode()">Save Code</app-button>
      <app-button (click)="executeCode()"> Execute Code </app-button>
      <app-button [disabled]="!visualizerStore.isExecuted()" (click)="playSimulation()"
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
  encapsulation: ViewEncapsulation.None,
})
export class MonacoEditorComponent extends BaseComponent implements OnInit {
  editorOptions = input<NgxMonacoEditorConfig>({
    defaultOptions: {
      glyphMargin: true,
      lineNumbers: 'off',
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
    },
  });
  executeCodeEvent = output<void>();
  playSimulationEvent = output<void>();

  code = model<string>('');
  editorInstance = signal<any>(null);
  currentDecorations = signal<string[]>([]);

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

    this.currentDecorations = editor.deltaDecorations(decorations, [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'highlight-current-line',
          glyphMarginClassName: 'highlight-glyph',
        },
      },
    ]);
  }

  clearHighlight() {
    const editor = this.editorInstance();
    const decorations = this.currentDecorations();
    if (editor) {
      this.currentDecorations = editor.deltaDecorations(decorations, []);
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
