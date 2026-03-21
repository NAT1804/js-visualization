import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { BaseComponent } from '../components/base/base.component';
import { MonacoEditorComponent } from '../components/editor/editor.component';
import { PromiseVisualizerComponent } from '../components/promise-visualizer/promise-visualizer.component';
import { LayoutComponent } from '../layouts/layout.component';

@Component({
  selector: 'app-home',
  imports: [LayoutComponent, MonacoEditorComponent, PromiseVisualizerComponent],
  template: `
    <app-layout>
      <app-editor
        #editor
        (executeCodeEvent)="executeCode()"
        (playSimulationEvent)="playSimulation()"
      ></app-editor>

      @for (promise of promises(); track promise.id) {
        <app-promise-visualizer [config]="promise"></app-promise-visualizer>
      }
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends BaseComponent {
  editor = viewChild<MonacoEditorComponent>('editor');
  promises = computed(() => this.visualizerStore.promisesEntities());

  executeCode() {
    this.visualizerStore.resetStore();
    this.visualizerStore.executeCode(this.editor()?.code() || '');
  }

  playSimulation() {
    this.visualizerStore.playVisualizer();
  }
}
