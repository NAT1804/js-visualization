import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type()"
      class="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      [ngClass]="classes()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <span
          class="size-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly classes = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
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
