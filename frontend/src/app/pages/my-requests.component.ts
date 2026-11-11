import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Booking, BookingStatus } from '../core/models';

@Component({
  selector: 'app-my-requests',
  imports: [TitleCasePipe, MatButtonModule, MatCardModule, MatIconModule, MatTableModule],
  template: `
    <section class="hero hero-soft">
      <h1>My requests 📬</h1>
      <p>Everything you've asked for, and where it stands.</p>
    </section>

    <div class="stats">
      <div class="stat"><span class="stat-emoji">⏳</span>
        <div><div class="stat-num">{{ count('PENDING') }}</div><div class="stat-label">Waiting for approval</div></div></div>
      <div class="stat"><span class="stat-emoji">✅</span>
        <div><div class="stat-num">{{ count('APPROVED') }}</div><div class="stat-label">Approved</div></div></div>
      <div class="stat"><span class="stat-emoji">💰</span>
        <div><div class="stat-num">₹{{ approvedTotal() }}</div><div class="stat-label">Approved total</div></div></div>
    </div>

    @if (bookings.length) {
      <mat-card class="table-card">
        <table mat-table [dataSource]="bookings">
          <ng-container matColumnDef="equipment">
            <th mat-header-cell *matHeaderCellDef>Equipment</th>
            <td mat-cell *matCellDef="let b">
              <strong>{{ b.equipmentName }}</strong><br>
              <span class="muted">{{ b.assetCode }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let b">{{ b.startDate }} → {{ b.endDate }}</td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let b">₹{{ b.totalCost }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let b">
              <span class="pill {{ b.status }}">{{ b.status | titlecase }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let b">
              @if (b.status === 'PENDING' || b.status === 'APPROVED') {
                <button mat-button color="warn" (click)="cancel(b)">Cancel</button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>
    } @else {
      <div class="empty-state">
        <span class="emoji">📭</span>
        <h3>No requests yet</h3>
        <p>Head to Browse to find equipment and send your first request.</p>
      </div>
    }
  `,
})
export class MyRequestsComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  bookings: Booking[] = [];
  columns = ['equipment', 'dates', 'total', 'status', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Booking[]>('/api/bookings/mine').subscribe(list => (this.bookings = list));
  }

  count(status: BookingStatus): number {
    return this.bookings.filter(b => b.status === status).length;
  }

  approvedTotal(): number {
    return this.bookings.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + b.totalCost, 0);
  }

  cancel(b: Booking): void {
    this.http.patch<Booking>(`/api/bookings/${b.id}/cancel`, {}).subscribe({
      next: () => {
        this.snack.open('Request cancelled.', 'Close', { duration: 3000 });
        this.load();
      },
      error: err => this.snack.open(err.error?.error ?? 'Could not cancel', 'Close', { duration: 4000 }),
    });
  }
}
