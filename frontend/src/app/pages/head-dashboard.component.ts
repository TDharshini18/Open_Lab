import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Booking, Equipment } from '../core/models';

@Component({
  selector: 'app-head-dashboard',
  imports: [
    FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatSelectModule, MatTableModule, MatTabsModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Department</h1>
        <p class="muted">Review requests and manage equipment for your department.</p>
      </div>
    </div>

    <mat-tab-group animationDuration="150ms">

      <!-- Pending requests -->
      <mat-tab [label]="'Pending requests (' + pending.length + ')'">
        <div class="tab-body">
          @if (pending.length) {
            <mat-card class="table-card">
              <table mat-table [dataSource]="pending">
                <ng-container matColumnDef="requester">
                  <th mat-header-cell *matHeaderCellDef>Requester</th>
                  <td mat-cell *matCellDef="let b">{{ b.requesterName }}</td>
                </ng-container>

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

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let b">
                    <button mat-flat-button color="primary" (click)="decide(b, true)">Approve</button>
                    <button mat-button color="warn" (click)="decide(b, false)">Reject</button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="pendingColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: pendingColumns;"></tr>
              </table>
            </mat-card>
          } @else {
            <mat-card class="empty">
              <mat-icon>task_alt</mat-icon>
              <p>No pending requests. You're all caught up.</p>
            </mat-card>
          }
        </div>
      </mat-tab>

      <!-- Equipment -->
      <mat-tab label="Equipment">
        <div class="tab-body">
          <div class="grid">
            @for (item of myEquipment; track item.id) {
              <mat-card class="equipment-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="avatar">biotech</mat-icon>
                  <mat-card-title>{{ item.name }}</mat-card-title>
                  <mat-card-subtitle>{{ item.assetCode }} · {{ item.category }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Status</mat-label>
                    <mat-select [value]="item.status" (selectionChange)="setStatus(item, $event.value)">
                      <mat-option value="AVAILABLE">Available</mat-option>
                      <mat-option value="MAINTENANCE">Under maintenance</mat-option>
                    </mat-select>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>
            } @empty {
              <mat-card class="empty">
                <mat-icon>inventory_2</mat-icon>
                <p>No equipment yet. Use the Add equipment tab to list your first item.</p>
              </mat-card>
            }
          </div>
        </div>
      </mat-tab>

      <!-- Add equipment -->
      <mat-tab label="Add equipment">
        <div class="tab-body">
          <mat-card class="form-card">
            <form (ngSubmit)="addEquipment()" class="add-form">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput name="name" [(ngModel)]="form.name" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <input matInput name="category" [(ngModel)]="form.category" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput name="description" [(ngModel)]="form.description">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Location</mat-label>
                <input matInput name="location" [(ngModel)]="form.location">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rate per day (₹)</mat-label>
                <input matInput type="number" min="0" name="rate" [(ngModel)]="form.ratePerDay" required>
              </mat-form-field>

              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit">Add equipment</button>
              </div>
            </form>
          </mat-card>
        </div>
      </mat-tab>

    </mat-tab-group>
  `,
  styles: [`
    .tab-body { padding: 24px 0; }
    .avatar { background: #e3f2fd; color: #1565c0; border-radius: 50%; padding: 8px; box-sizing: border-box; }
    .form-card { max-width: 560px; }
    .add-form { display: flex; flex-direction: column; gap: 4px; }
    .form-actions { margin-top: 8px; }
  `],
})
export class HeadDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  pending: Booking[] = [];
  myEquipment: Equipment[] = [];
  pendingColumns = ['requester', 'equipment', 'dates', 'total', 'actions'];

  form = { name: '', category: '', description: '', location: '', ratePerDay: 0 };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<Booking[]>('/api/bookings/pending').subscribe(list => (this.pending = list));
    this.http.get<Equipment[]>('/api/equipment/mine').subscribe(list => (this.myEquipment = list));
  }

  decide(b: Booking, approve: boolean): void {
    const action = approve ? 'approve' : 'reject';
    this.http.patch<Booking>(`/api/bookings/${b.id}/${action}`, {}).subscribe({
      next: () => {
        this.snack.open(`Request ${approve ? 'approved' : 'rejected'}.`, 'Close', { duration: 3000 });
        this.loadAll();
      },
      error: err => this.snack.open(err.error?.error ?? 'Action failed', 'Close', { duration: 4000 }),
    });
  }

  setStatus(item: Equipment, status: string): void {
    this.http.patch<Equipment>(`/api/equipment/${item.id}/status`, { status }).subscribe({
      next: () => {
        this.snack.open(`${item.name} is now ${status.toLowerCase()}.`, 'Close', { duration: 3000 });
        this.loadAll();
      },
      error: err => this.snack.open(err.error?.error ?? 'Update failed', 'Close', { duration: 4000 }),
    });
  }

  addEquipment(): void {
    this.http.post<Equipment>('/api/equipment', this.form).subscribe({
      next: () => {
        this.snack.open('Equipment added.', 'Close', { duration: 3000 });
        this.form = { name: '', category: '', description: '', location: '', ratePerDay: 0 };
        this.loadAll();
      },
      error: err => this.snack.open(err.error?.error ?? 'Could not add equipment', 'Close', { duration: 4000 }),
    });
  }
}