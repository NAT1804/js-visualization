import { VisualizerStore } from '@/app/stores/visualizer.store';
import { inject } from '@angular/core';

export abstract class BaseComponent {
  protected readonly visualizerStore = inject(VisualizerStore);
}
