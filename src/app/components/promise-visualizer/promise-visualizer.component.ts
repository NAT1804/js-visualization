import { PromiseVisualizerState } from '@/app/stores/promise.store';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LineComponent } from '@components/line/line.component';
import { NodeComponent } from '@components/node/node.component';
import { LineCap, LineStyle } from '@models/app.enum';
import { ILine } from '@models/app.model';
import { ViewEditorComponent } from '../editor/view-editor.component';

@Component({
  selector: 'app-promise-visualizer',
  imports: [NodeComponent, LineComponent, ViewEditorComponent],
  template: `
    <div
      #containerNode
      class="relative flex flex-wrap gap-8 h-full"
      animate.enter="promise-enter"
      animate.leave="promise-leave"
    >
      <app-node
        [config]="{ id: PROMISE_OBJECT_NODE_ID, title: 'Promise Object', width: '350px' }"
        (rendered)="handleRendered($event)"
      >
        @if (state()) {
          <app-node [config]="{ title: '[[PromiseState]]', width: '300px' }">
            <p class="text-white text-center">
              {{ state() }}
            </p>
          </app-node>
        }
        @if (result()) {
          <app-node [config]="{ title: '[[PromiseResult]]', width: '300px' }">
            <p class="text-white text-center">
              {{ result() }}
            </p>
          </app-node>
        }
        @if (fulfilledReactions()) {
          <app-node [config]="{ title: '[[PromiseFulfilledReactions]]', width: '300px' }">
            @let fulfilledReactionsList = fulfilledReactions();
            @if (fulfilledReactionsList && fulfilledReactionsList.length > 0) {
              @for (reaction of fulfilledReactionsList; track $index) {
                <app-node
                  [config]="{
                    title: '[[PromiseReaction]]',
                    width: '250px',
                    borderTitleColor: 'green',
                    borderContentColor: 'green',
                  }"
                >
                  <app-node [config]="{ title: '[[Handler]]', width: '200px' }">
                    <app-view-editor [(value)]="reaction.handler"></app-view-editor>
                  </app-node>
                </app-node>
              }
            }
          </app-node>
        }
        @if (rejectedReactions()) {
          <app-node [config]="{ title: '[[PromiseRejectedReactions]]', width: '300px' }">
            @let rejectedReactionsList = rejectedReactions();
            @if (rejectedReactionsList && rejectedReactionsList.length > 0) {
              @for (reaction of rejectedReactionsList; track $index) {
                <app-node
                  [config]="{
                    title: '[[PromiseReaction]]',
                    width: '250px',
                    borderTitleColor: 'red',
                    borderContentColor: 'red',
                  }"
                >
                  <app-node [config]="{ title: '[[Handler]]', width: '200px' }">
                    <app-view-editor [(value)]="reaction.handler"></app-view-editor>
                  </app-node>
                </app-node>
              }
            }
          </app-node>
        }

        <app-node [config]="{ title: '[[PromiseIsHandlers]]', width: '300px' }">
          <p class="text-white text-center">
            {{ isHandlers() }}
          </p>
        </app-node>
      </app-node>

      <app-node [config]="{ title: 'Promise Capability', width: '250px' }">
        <app-node
          [config]="{ id: PROMISE_POINTER_NODE_ID, title: '[[Promise]]', width: '150px' }"
          (rendered)="handleRendered($event)"
        >
        </app-node>
        <app-node
          [config]="{
            title: '[[Resolve]]',
            width: '150px',
            isShaking: isFulfilledReactionsShaking(),
          }"
        >
          <p class="text-white text-center">
            {{ 'function' }}
          </p>
        </app-node>
        <app-node
          [config]="{
            title: '[[Reject]]',
            width: '150px',
            isShaking: isRejectedReactionsShaking(),
          }"
        >
          <p class="text-white text-center">
            {{ 'function' }}
          </p>
        </app-node>
      </app-node>

      <app-line [config]="lineConfig()"></app-line>
    </div>
  `,
  styles: [
    `
      .promise-enter {
        animation: flyIn 0.3s ease-out forwards;
      }

      .promise-leave {
        animation: flyOut 0.5s ease-in forwards;
      }

      @keyframes flyIn {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes flyOut {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromiseVisualizerComponent {
  readonly config = input<PromiseVisualizerState>();
  readonly LineStyle = LineStyle;
  readonly LineCap = LineCap;
  readonly containerNode = viewChild<ElementRef<HTMLDivElement>>('containerNode');
  readonly promiseNodes = viewChildren(NodeComponent);
  readonly PROMISE_OBJECT_NODE_ID = 'promiseObjectNode';
  readonly PROMISE_POINTER_NODE_ID = 'promisePointerNode';

  state = computed(() => this.config()?.promiseState);
  result = computed(() => this.config()?.promiseResult);
  fulfilledReactions = computed(() => this.config()?.fulfilledReactions);
  rejectedReactions = computed(() => this.config()?.rejectedReactions);
  isHandlers = computed(() => this.config()?.isHandlers);
  isFulfilledReactionsShaking = computed(
    () => !!this.config()?.fulfilledReactions && this.config()?.isShaking,
  );
  isRejectedReactionsShaking = computed(
    () => !!this.config()?.rejectedReactions && this.config()?.isShaking,
  );

  promiseObjectNode = signal<NodeComponent | undefined>(undefined);
  promisePointerNode = signal<NodeComponent | undefined>(undefined);
  private readonly rerenderTick = signal(0);

  @HostListener('window:resize')
  onWindowResize() {
    this.triggerRerender();
  }

  lineConfig = computed(() => {
    this.rerenderTick();
    this.config();
    const promisePointerNode = this.promisePointerNode();
    const promiseObjectNode = this.promiseObjectNode();
    const containerNode = this.containerNode()?.nativeElement;
    if (promisePointerNode && promiseObjectNode && containerNode) {
      const promisePointerNodeRect = promisePointerNode.getBoundingClientRect();
      const promiseObjectNodeRect = promiseObjectNode.getBoundingClientRect();
      const containerNodeRect = containerNode.getBoundingClientRect();
      return {
        start: {
          x:
            promisePointerNodeRect.left - containerNodeRect.left + promisePointerNodeRect.width / 2,
          y: promisePointerNodeRect.top - containerNodeRect.top + promisePointerNodeRect.height / 2,
        },
        end: {
          x: promiseObjectNodeRect.left - containerNodeRect.left + promiseObjectNodeRect.width,
          y: promiseObjectNodeRect.top - containerNodeRect.top + 100,
        },
        style: LineStyle.Dotted,
        cap: LineCap.Square,
      } as ILine;
    }
    return {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      style: LineStyle.Dotted,
      cap: LineCap.Square,
    };
  });

  triggerRerender() {
    this.rerenderTick.update((v) => v + 1);
  }

  handleRendered(id: string) {
    if (id === this.PROMISE_OBJECT_NODE_ID) {
      const promiseObjectNode = this.promiseNodes().find((node) => node.id() === id);
      if (promiseObjectNode) {
        this.promiseObjectNode.set(promiseObjectNode);
      }
    } else if (id === this.PROMISE_POINTER_NODE_ID) {
      const promisePointerNode = this.promiseNodes().find((node) => node.id() === id);
      if (promisePointerNode) {
        this.promisePointerNode.set(promisePointerNode);
      }
    }
  }
}
