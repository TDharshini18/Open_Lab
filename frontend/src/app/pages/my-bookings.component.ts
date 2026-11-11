import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Booking } from '../core/models';

@Component({
  selector: 'app-my-bookings',
  imports: [TitleCasePipe, MatButtonModule, MatCardModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-header">
      <div>
        <h1>My bookings</h1>
        <p class="muted">Track your requests and cancel any you no longer need.</p>
      </div>
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
            <td mat-cell *matCellDef="let b">{{ b.startDate }} to {{ b.endDate }}</td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let b">₹{{ b.totalCost }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let b">
              <span class="status {{ b.status }}">{{ b.status | titlecase }}</span>
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
      <mat-card class="empty">
        <mat-icon>event_available</mat-icon>
        <p>No bookings yet. Browse equipment to make your first request.</p>
      </mat-card>
    }
  `,
})
export class MyBookingsComponent implements OnInit {
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

  cancel(b: Booking): void {
    this.http.patch<Booking>(`/api/bookings/${b.id}/cancel`, {}).subscribe({
      next: () => {
        this.snack.open('Booking cancelled.', 'Close', { duration: 3000 });
        this.load();
      },
      error: err => this.snack.open(err.error?.error ?? 'Could not cancel', 'Close', { duration: 4000 }),
    });
  }
}