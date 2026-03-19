import { generateRandomId } from '@/app/helpers/generate-random-id';
import { NgClass, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { INodeConfig } from '@models/app.model';

@Component({
  selector: 'app-node',
  imports: [NgClass, NgStyle],
  template: `
    <div #host class="relative" [ngStyle]="{ width: nodeWidth(), height: nodeHeight() }">
      <div
        #nodeTitle
        class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-lg border border-gray-300 bg-slate-900 shadow-lg"
        [ngStyle]="{ 'background-color': config().bgTitleColor }"
      >
        <h1 class="text-base font-semibold text-slate-50 text-nowrap">
          {{ config().title }}
        </h1>
      </div>
      <div
        class="p-4 rounded-lg border border-gray-300 bg-slate-900 shadow-lg"
        [ngClass]="{ 'bg-red-500': config().bgContentColor }"
        [ngStyle]="{ 'background-color': config().bgContentColor }"
      >
        <div #content class="flex flex-col gap-4 mt-4 items-center justify-center">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: 1rem;
        width: fit-content;
        height: fit-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeComponent {
  readonly rendered = output<string>();

  readonly config = input.required<INodeConfig>();

  readonly nodeWidth = computed(() => this.config().width ?? '400px');
  readonly nodeHeight = computed(() => this.config().height ?? 'auto');
  readonly id = computed(() => this.config().id ?? 'node-' + generateRandomId());

  readonly hostRef = viewChild<ElementRef<HTMLDivElement>>('host');

  ngAfterViewInit(): void {
    queueMicrotask(() => this.rendered.emit(this.id()));
  }

  getBoundingClientRect(): DOMRect {
    const hostEl = this.hostRef()?.nativeElement;
    if (!hostEl) {
      return new DOMRect();
    }
    return hostEl.getBoundingClientRect();
  }
}
