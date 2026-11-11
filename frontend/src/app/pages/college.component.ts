import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Booking, Equipment } from '../core/models';
import { colorFor } from '../core/ui';
import { ConfirmDialogComponent, UnavailableDialogComponent } from './dialogs';

@Component({
  selector: 'app-college',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule,
            MatInputModule, MatTableModule, MatTabsModule],
  template: `
    <section class="hero">
      <h1>{{ orgName() }} 🏫</h1>
      <p>Share your lab equipment, block out maintenance days, and approve requests from companies.</p>
    </section>

    <div class="stats">
      <div class="stat"><span class="stat-emoji">🧰</span>
        <div><div class="stat-num">{{ items.length }}</div><div class="stat-label">Items listed</div></div></div>
      <div class="stat"><span class="stat-emoji">📥</span>
        <div><div class="stat-num">{{ incoming.length }}</div><div class="stat-label">Requests to review</div></div></div>
    </div>

    <mat-tab-group animationDuration="150ms">
      <mat-tab label="My equipment">
        <div class="tab-body">
          @if (items.length) {
            <div class="grid">
              @for (item of items; track item.id) {
                <mat-card class="item-card">
                  <mat-card-header>
                    <div mat-card-avatar class="avatar" [style.background]="color(item.category)">
                      {{ item.name.charAt(0) }}
                    </div>
                    <mat-card-title>{{ item.name }}</mat-card-title>
                    <mat-card-subtitle>{{ item.assetCode }} · {{ item.category }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ item.description }}</p>
                    <p class="muted">📍 {{ item.location }}</p>
                    <p class="rate"><strong>₹{{ item.ratePerDay }}</strong> <span class="muted">/ day</span></p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button (click)="openUnavailable(item)">
                      <mat-icon>event_busy</mat-icon> Block dates
                    </button>
                    <button mat-button color="warn" (click)="remove(item)">
                      <mat-icon>delete</mat-icon> Remove
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="emoji">🧪</span>
              <h3>No equipment yet</h3>
              <p>Use the Add equipment tab to list your first item.</p>
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab [label]="'Requests (' + incoming.length + ')'">
        <div class="tab-body">
          @if (incoming.length) {
            <mat-card class="table-card">
              <table mat-table [dataSource]="incoming">
                <ng-container matColumnDef="requester">
                  <th mat-header-cell *matHeaderCellDef>Requested by</th>
                  <td mat-cell *matCellDef="let b">
                    <strong>{{ b.requesterOrganization }}</strong><br>
                    <span class="muted">{{ b.requesterName }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="equipment">
                  <th mat-header-cell *matHeaderCellDef>Equipment</th>
                  <td mat-cell *matCellDef="let b">{{ b.equipmentName }}<br><span class="muted">{{ b.assetCode }}</span></td>
                </ng-container>

                <ng-container matColumnDef="dates">
                  <th mat-header-cell *matHeaderCellDef>Dates</th>
                  <td mat-cell *matCellDef="let b">{{ b.startDate }} → {{ b.endDate }}</td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let b">₹{{ b.totalCost }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let b" class="actions">
                    <button mat-flat-button color="primary" (click)="decide(b, true)">
                      <mat-icon>check</mat-icon> Approve
                    </button>
                    <button mat-button color="warn" (click)="decide(b, false)">
                      <mat-icon>close</mat-icon> Reject
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="requestColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: requestColumns;"></tr>
              </table>
            </mat-card>
          } @else {
            <div class="empty-state">
              <span class="emoji">📭</span>
              <h3>All caught up</h3>
              <p>No requests are waiting for you.</p>
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="Add equipment">
        <div class="tab-body">
          <mat-card class="form-card">
            <form class="stack" (ngSubmit)="addEquipment()">
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
              <div>
                <button mat-flat-button color="primary" type="submit">
                  <mat-icon>add</mat-icon> Add equipment
                </button>
              </div>
            </form>
          </mat-card>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .tab-body { padding: 24px 0; }
    .form-card { max-width: 620px; padding: 24px !important; border-radius: 18px !important; }
    .actions { display: flex; gap: 8px; align-items: center; }
    .rate { font-size: 16px; }
    mat-card-actions { display: flex; gap: 8px; }
  `],
})
export class CollegeComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  items: Equipment[] = [];
  incoming: Booking[] = [];
  requestColumns = ['requester', 'equipment', 'dates', 'total', 'actions'];
  form = { name: '', category: '', description: '', location: '', ratePerDay: 0 };

  ngOnInit(): void {
    this.loadAll();
  }

  orgName(): string {
    return this.items[0]?.organizationName ?? 'Your college';
  }

  color(category: string): string {
    return colorFor(category);
  }

  loadAll(): void {
    this.http.get<Equipment[]>('/api/equipment/mine').subscribe(list => (this.items = list));
    this.http.get<Booking[]>('/api/bookings/incoming').subscribe(list => (this.incoming = list));
  }

  openUnavailable(item: Equipment): void {
    this.dialog.open(UnavailableDialogComponent, { data: item, width: '560px' });
  }

  remove(item: Equipment): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove this equipment?',
        message: `${item.name} will be removed. Items with any booking history can't be removed.`,
        confirmText: 'Remove',
      },
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.http.delete(`/api/equipment/${item.id}`).subscribe({
        next: () => {
          this.snack.open(`${item.name} removed.`, 'Close', { duration: 3000 });
          this.loadAll();
        },
        error: err => this.snack.open(err.error?.error ?? 'Could not remove', 'Close', { duration: 5000 }),
      });
    });
  }

  decide(b: Booking, approve: boolean): void {
    const action = approve ? 'approve' : 'reject';
    this.http.patch<Booking>(`/api/bookings/${b.id}/${action}`, {}).subscribe({
      next: () => {
        this.snack.open(approve ? '✅ Request approved.' : 'Request rejected.', 'Close', { duration: 3000 });
        this.loadAll();
      },
      error: err => this.snack.open(err.error?.error ?? 'Action failed', 'Close', { duration: 4000 }),
    });
  }

  addEquipment(): void {
    this.http.post<Equipment>('/api/equipment', this.form).subscribe({
      next: () => {
        this.snack.open('🎉 Equipment added.', 'Close', { duration: 3000 });
        this.form = { name: '', category: '', description: '', location: '', ratePerDay: 0 };
        this.loadAll();
      },
      error: err => this.snack.open(err.error?.error ?? 'Could not add equipment', 'Close', { duration: 4000 }),
    });
  }
}
