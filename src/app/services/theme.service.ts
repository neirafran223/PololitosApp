import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'dark' | 'light' = 'dark';

  constructor(
    private rendererFactory: RendererFactory2,
    private storage: Storage
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.init();
  }

  async init() {
    await this.storage.create();
    const storedTheme = await this.storage.get('theme');
    this.currentTheme = storedTheme || 'dark';
    this.updateBodyClass();
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.updateBodyClass();
  }

  private async updateBodyClass() {
    const body = document.body;
    if (this.currentTheme === 'light') {
      this.renderer.addClass(body, 'light-theme');
    } else {
      this.renderer.removeClass(body, 'light-theme');
    }
    await this.storage.set('theme', this.currentTheme);
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }
}