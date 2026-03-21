import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-view-editor',
  imports: [MonacoEditorModule, FormsModule],
  template: `
    <div class="viewer-container" [style.height]="viewContainerHeightCss()">
      <ngx-monaco-editor
        [options]="options()"
        [(ngModel)]="value"
        (onInit)="onEditorInit($event)"
      ></ngx-monaco-editor>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .viewer-container {
        width: 100%;
        min-height: 20px;
        border-radius: 6px;
        overflow: hidden;
        background-color: #1e1e1e;
      }

      ngx-monaco-editor {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ViewEditorComponent {
  private DEFAULT_LINE_HEIGHT = 20;

  options = input<any>({
    readOnly: true,
    lineNumbers: 'off',
    glyphMargin: false,
    lineHeight: this.DEFAULT_LINE_HEIGHT,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: false,
    contextmenu: false,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    renderLineHighlight: 'none',
  });
  value = model<string>('');

  editorInstance = signal<any>(null);

  viewContainerHeight = signal<number>(this.DEFAULT_LINE_HEIGHT);

  viewContainerHeightCss = computed(() => `${this.viewContainerHeight()}px`);

  onEditorInit(editor: any) {
    this.editorInstance.set(editor);
    const lineCount = editor.getModel().getLineCount();
    const newHeight = lineCount * this.DEFAULT_LINE_HEIGHT;
    this.viewContainerHeight.set(newHeight);
    setTimeout(() => {
      editor.layout();
    }, 0);
  }
}
