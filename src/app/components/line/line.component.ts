import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ILine } from '@models/app.model';
import { LineStyle } from '@models/app.enum';

@Component({
  selector: 'app-line',
  imports: [],
  template: `
    <svg
      class="pointer-events-none absolute w-full h-full inset-0 overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" class="fill-slate-300" />
        </marker>
      </defs>

      <circle [attr.cx]="startX()" [attr.cy]="startY()" r="4" class="fill-slate-300" />

      <line
        [attr.x1]="startX()"
        [attr.y1]="startY()"
        [attr.x2]="endX()"
        [attr.y2]="endY()"
        class="stroke-slate-400"
        stroke-width="2"
        stroke="black"
        [attr.stroke-linecap]="lineStyleLinecap()"
        [attr.stroke-dasharray]="lineStyleDashArray()"
        marker-end="url(#arrow-head)"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineComponent {
  readonly config = input.required<ILine>();

  readonly startX = computed(() => this.config().start.x);
  readonly startY = computed(() => this.config().start.y);
  readonly endX = computed(() => this.config().end.x);
  readonly endY = computed(() => this.config().end.y);
  readonly lineStyleDashArray = computed(() => {
    return this.config().style === LineStyle.Dotted
      ? '2 6'
      : this.config().style === LineStyle.Dashed
        ? '6 6'
        : null;
  });
  readonly lineStyleLinecap = computed(() => this.config().cap);
}
