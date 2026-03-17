import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NodeComponent } from './components/node/node.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NodeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('js-visualization');
}
