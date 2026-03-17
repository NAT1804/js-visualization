import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { INodeConfig } from './node.model';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-node',
  imports: [NgClass, NgStyle],
  template: `
    <div class="relative h-fit w-fit">
      <div
        #nodeTitle
        class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-lg border border-gray-300 bg-slate-900 shadow-lg w-fit h-fit"
        [ngStyle]="{ 'background-color': config().bgTitleColor }"
      >
        <h1 class="text-base font-semibold text-slate-50">{{ config().title }}</h1>
      </div>
      <div
        class="p-4 rounded-lg border border-gray-300 bg-slate-900 shadow-lg w-fit h-fit"
        [ngClass]="{ 'bg-red-500': config().bgContentColor }"
        [ngStyle]="{ 'background-color': config().bgContentColor }"
      >
        <ng-content></ng-content>
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
  readonly config = input.required<INodeConfig>();
}
