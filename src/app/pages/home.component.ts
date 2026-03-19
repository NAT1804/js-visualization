import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EVENT_TYPE } from '@models/app.enum';
import { IPromiseNodeConfig, WorkerEvent } from '@models/app.model';
import { interval, take, tap } from 'rxjs';
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

      <app-promise-visualizer [config]="promiseConfig()"></app-promise-visualizer>
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends BaseComponent {
  editor = viewChild<MonacoEditorComponent>('editor');

  promiseConfig = computed(() => ({
    state: this.visualizerStore.promiseState(),
    result: this.visualizerStore.promiseResult(),
    fulfilledReactions: this.visualizerStore.fulfilledReactions(),
    rejectedReactions: this.visualizerStore.rejectedReactions(),
    isHandlers: this.visualizerStore.isHandlers(),
  }));

  executeCode() {
    this.visualizerStore.executeCode(this.editor()?.code() || '');
  }

  playSimulation() {
    this.visualizerStore.playVisualizer();
  }
}
