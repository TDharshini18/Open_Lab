import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, TitleCasePipe } from '@angular/common';
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
import { OrgStatus, Organization } from '../core/models';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe, TitleCasePipe, MatButtonModule, MatCardModule, MatFormFieldModule,
            MatIconModule, MatInputModule, MatSelectModule, MatTableModule, MatTabsModule],
  template: `
    <section class="hero hero-admin">
      <h1>Admin console 🛡️</h1>
      <p>Approve colleges and companies, and manage who has access to OpenLabs.</p>
    </section>

    <mat-tab-group animationDuration="150ms">
      <mat-tab label="Registrations">
        <div class="tab-body">
          <div class="toolbar-row">
            <mat-form-field appearance="outline" class="filter">
              <mat-label>Show</mat-label>
              <mat-select [(ngModel)]="status" (selectionChange)="load()">
                <mat-option value="PENDING">⏳ Pending</mat-option>
                <mat-option value="APPROVED">✅ Approved</mat-option>
                <mat-option value="REJECTED">⛔ Rejected</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (orgs.length) {
            <mat-card class="table-card">
              <table mat-table [dataSource]="orgs">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Organization</th>
                  <td mat-cell *matCellDef="let o"><strong>{{ o.name }}</strong></td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let o">{{ o.type === 'COLLEGE' ? '🏫 College' : '🏢 Company' }}</td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Registered</th>
                  <td mat-cell *matCellDef="let o">{{ o.createdAt | date: 'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let o"><span class="pill {{ o.status }}">{{ o.status | titlecase }}</span></td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let o" class="actions">
                    @if (o.status !== 'APPROVED') {
                      <button mat-flat-button color="primary" (click)="approve(o)">
                        <mat-icon>check</mat-icon> Approve
                      </button>
                    }
                    @if (o.status !== 'REJECTED') {
                      <button mat-button color="warn" (click)="reject(o)">
                        <mat-icon>close</mat-icon> Reject
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              </table>
            </mat-card>
          } @else {
            <div class="empty-state">
              <span class="emoji">🎈</span>
              <h3>Nothing here</h3>
              <p>No {{ status.toLowerCase() }} registrations right now.</p>
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="Create admin">
        <div class="tab-body">
          <mat-card class="form-card">
            <form class="stack" (ngSubmit)="createAdmin()">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput name="name" [(ngModel)]="adminForm.name" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" name="email" [(ngModel)]="adminForm.email" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Temporary password (min 8 characters)</mat-label>
                <input matInput type="password" name="password" [(ngModel)]="adminForm.password" minlength="8" required>
              </mat-form-field>
              <div>
                <button mat-flat-button color="primary" type="submit">
                  <mat-icon>person_add</mat-icon> Create admin
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
    .filter { min-width: 240px; }
    .form-card { max-width: 560px; padding: 24px !important; border-radius: 18px !important; }
    .actions { display: flex; gap: 8px; align-items: center; }
    .hero-admin { background: linear-gradient(120deg, #0f172a, #4338ca); }
  `],
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  status: OrgStatus = 'PENDING';
  orgs: Organization[] = [];
  columns = ['name', 'type', 'created', 'status', 'actions'];
  adminForm = { name: '', email: '', password: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Organization[]>('/api/admin/organizations', { params: { status: this.status } })
      .subscribe(list => (this.orgs = list));
  }

  approve(o: Organization): void {
    this.act(`/api/admin/organizations/${o.id}/approve`, `✅ ${o.name} approved.`);
  }

  reject(o: Organization): void {
    this.act(`/api/admin/organizations/${o.id}/reject`, `${o.name} rejected.`);
  }

  createAdmin(): void {
    this.http.post<{ message: string }>('/api/admin/admins', this.adminForm).subscribe({
      next: res => {
        this.snack.open(`🛡️ ${res.message}`, 'Close', { duration: 3000 });
        this.adminForm = { name: '', email: '', password: '' };
      },
      error: err => this.snack.open(err.error?.error ?? 'Could not create admin', 'Close', { duration: 4000 }),
    });
  }

  private act(url: string, success: string): void {
    this.http.patch<Organization>(url, {}).subscribe({
      next: () => {
        this.snack.open(success, 'Close', { duration: 3000 });
        this.load();
      },
      error: err => this.snack.open(err.error?.error ?? 'Action failed', 'Close', { duration: 4000 }),
    });
  }
}
