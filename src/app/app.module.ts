import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular'; // <-- Importar
import { fadeAnimation } from './animations/nav-animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LucideAngularModule, icons } from 'lucide-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    IonicModule.forRoot({
      navAnimation: fadeAnimation // <-- Aplica la animación globalmente
    }),
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(), // <-- Configurar
    LucideAngularModule.pick(icons)
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}