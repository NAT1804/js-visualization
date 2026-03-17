import { TemplateRef } from '@angular/core';

export interface INodeConfig {
  title: string;
  bgTitleColor?: string;
  bgContentColor?: string;
  content?: string | TemplateRef<unknown>;
}
