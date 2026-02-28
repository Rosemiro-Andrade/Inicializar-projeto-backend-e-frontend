import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span style="margin-right: 20px;">Monitoramento Máquinas</span>

      <button mat-button routerLink="/">Dashboard</button>
      <button mat-button routerLink="/admin">Administração</button>
    </mat-toolbar>

    <div style="padding: 20px;">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}