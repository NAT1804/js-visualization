import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  HostListener,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LineComponent } from '@components/line/line.component';
import { NodeComponent } from '@components/node/node.component';
import { ILine, IPromiseNodeConfig } from '@models/app.model';
import { LineCap, LineStyle } from '@models/app.enum';

@Component({
  selector: 'app-promise-visualizer',
  imports: [NodeComponent, LineComponent],
  template: `
    <div #containerNode class="relative flex flex-wrap gap-8 items-center justify-center h-full">
      <app-node
        [config]="{ id: PROMISE_OBJECT_NODE_ID, title: 'Promise Object', width: '350px' }"
        (rendered)="handleRendered($event)"
      >
        <app-node [config]="{ title: '[[PromiseState]]', width: '300px' }">
          <p class="text-white text-center">
            {{ state() }}
          </p>
        </app-node>
        <app-node [config]="{ title: '[[PromiseResult]]', width: '300px' }">
          <p class="text-white text-center">
            {{ result() }}
          </p>
        </app-node>
        <app-node [config]="{ title: '[[PromiseFulfilledReactions]]', width: '300px' }">
          @let fulfilledReactionsList = fulfilledReactions();
          @if (fulfilledReactionsList && fulfilledReactionsList.length > 0) {
            @for (reaction of fulfilledReactionsList; track $index) {
              <p class="text-white text-center">
                {{ reaction }}
              </p>
            }
          }
        </app-node>
        <app-node [config]="{ title: '[[PromiseRejectedReactions]]', width: '300px' }">
          @let rejectedReactionsList = rejectedReactions();
          @if (rejectedReactionsList && rejectedReactionsList.length > 0) {
            @for (reaction of rejectedReactionsList; track $index) {
              <p class="text-white text-center">
                {{ reaction }}
              </p>
            }
          }
        </app-node>
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
        <app-node [config]="{ title: '[[Resolve]]', width: '150px' }">
          <p class="text-white text-center">
            {{ 'function' }}
          </p>
        </app-node>
        <app-node [config]="{ title: '[[Reject]]', width: '150px' }">
          <p class="text-white text-center">
            {{ 'function' }}
          </p>
        </app-node>
      </app-node>

      <app-line [config]="lineConfig()"></app-line>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromiseVisualizerComponent {
  readonly config = input<IPromiseNodeConfig>({});
  readonly LineStyle = LineStyle;
  readonly LineCap = LineCap;
  readonly containerNode = viewChild<ElementRef<HTMLDivElement>>('containerNode');
  readonly promiseNodes = viewChildren(NodeComponent);
  readonly PROMISE_OBJECT_NODE_ID = 'promiseObjectNode';
  readonly PROMISE_POINTER_NODE_ID = 'promisePointerNode';

  state = computed(() => this.config().state);
  result = computed(() => this.config().result);
  fulfilledReactions = computed(() => this.config().fulfilledReactions);
  rejectedReactions = computed(() => this.config().rejectedReactions);
  isHandlers = computed(() => this.config().isHandlers);

  promiseObjectNode = signal<NodeComponent | undefined>(undefined);
  promisePointerNode = signal<NodeComponent | undefined>(undefined);
  private readonly windowResizeTick = signal(0);

  @HostListener('window:resize')
  onWindowResize() {
    this.windowResizeTick.update((v) => v + 1);
  }

  lineConfig = computed(() => {
    this.windowResizeTick();
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
          y: promiseObjectNodeRect.top - containerNodeRect.top + promiseObjectNodeRect.height / 2,
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
