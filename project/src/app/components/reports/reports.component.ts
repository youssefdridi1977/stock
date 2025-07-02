import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 text-gradient fw-bold">Rapports</h1>
          <p class="text-muted">Analyses et statistiques</p>
        </div>
        <button class="btn btn-primary">
          <i class="bi bi-download me-2"></i>
          Exporter
        </button>
      </div>

      <div class="card">
        <div class="card-body text-center py-5">
          <i class="bi bi-graph-up text-muted" style="font-size: 4rem;"></i>
          <h5 class="text-muted mt-3">Module Rapports</h5>
          <p class="text-muted">Cette fonctionnalité sera implémentée prochainement.</p>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {}