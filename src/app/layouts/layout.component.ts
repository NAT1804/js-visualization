import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  imports: [],
  template: `
    <div class="grid grid-cols-12 gap-4 p-4 w-screen h-screen">
      <div class="col-span-6">
        <ng-content select="app-editor"></ng-content>
      </div>
      <div class="col-span-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
