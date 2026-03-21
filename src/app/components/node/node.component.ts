import { generateRandomId } from '@/app/helpers/generate-random-id';
import { NgStyle } from '@angular/common';
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
  imports: [NgStyle],
  template: `
    <div
      #host
      class="relative"
      [ngStyle]="{ width: nodeWidth(), height: nodeHeight() }"
      animate.enter="node-enter"
      animate.leave="node-leave"
      [class.shake-animation]="config().isShaking"
    >
      <div
        #nodeTitle
        class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-lg border border-gray-300 bg-slate-900 shadow-lg"
        [ngStyle]="{
          'background-color': config().bgTitleColor,
          'border-color': config().borderTitleColor,
        }"
      >
        <h1 class="text-base font-semibold text-slate-50 text-nowrap">
          {{ config().title }}
        </h1>
      </div>
      <div
        class="p-4 rounded-lg border border-gray-300 bg-slate-900 shadow-lg"
        [ngStyle]="{
          'background-color': config().bgContentColor,
          'border-color': config().borderContentColor,
        }"
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

      .node-enter {
        animation: flyIn 0.3s ease-out forwards;
      }

      .node-leave {
        animation: flyOut 0.25s ease-in forwards;
      }

      @keyframes flyIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes flyOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
      }

      .shake-animation {
        animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
      }

      @keyframes shake {
        10%,
        90% {
          transform: translate3d(-1px, 0, 0);
        }
        20%,
        80% {
          transform: translate3d(2px, 0, 0);
        }
        30%,
        50%,
        70% {
          transform: translate3d(-4px, 0, 0);
        }
        40%,
        60% {
          transform: translate3d(4px, 0, 0);
        }
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
