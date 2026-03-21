import { TemplateRef } from '@angular/core';
import { PROMISE_STATE } from './app.enum';
import { LineCap, LineStyle } from './app.enum';

export type IPoint = {
  x: number;
  y: number;
};

export type ILine = {
  start: IPoint;
  end: IPoint;
  style: LineStyle;
  cap: LineCap;
};

export interface INodeConfig {
  id?: string;
  title: string;
  width?: string;
  height?: string;
  bgTitleColor?: string;
  borderTitleColor?: string;
  bgContentColor?: string;
  borderContentColor?: string;
  content?: string | TemplateRef<unknown>;
  isShaking?: boolean;
}

export interface WorkerEvent {
  type: string;
  payload?: any;
}
