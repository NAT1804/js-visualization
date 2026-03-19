import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type()"
      class="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      [ngClass]="classes()"
      [disabled]="disabled()"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly classes = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /**
   * Emits after preventing native/default click behavior.
   */
  readonly click = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.click.emit(event);
  }
}
