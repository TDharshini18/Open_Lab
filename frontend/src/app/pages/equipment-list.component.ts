import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Booking, Equipment } from '../core/models';
import { toIsoDate } from '../core/dates';

@Component({
  selector: 'app-equipment-list',
  imports: [
    FormsModule, MatButtonModule, MatCardModule, MatDatepickerModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Browse equipment</h1>
        <p class="muted">Request lab equipment from any department.</p>
      </div>

      <mat-form-field appearance="outline" class="filter">
        <mat-label>Category</mat-label>
        <mat-select [(ngModel)]="category">
          <mat-option value="">All categories</mat-option>
          @for (c of categories(); track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    <div class="grid">
      @for (item of visibleItems(); track item.id) {
        <mat-card class="equipment-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="avatar">biotech</mat-icon>
            <mat-card-title>{{ item.name }}</mat-card-title>
            <mat-card-subtitle>{{ item.assetCode }} · {{ item.departmentName }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>{{ item.description }}</p>
            <p class="muted"><mat-icon inline>place</mat-icon> {{ item.location }}</p>

            <div>
              <span class="tag">{{ item.category }}</span>
              <span class="status {{ item.status }}">
                {{ item.status === 'AVAILABLE' ? 'Available' : 'Under maintenance' }}
              </span>
            </div>

            <p class="rate"><strong>₹{{ item.ratePerDay }}</strong> <span class="muted">per day</span></p>

            @if (item.status === 'AVAILABLE') {
              <div class="dates">
                <mat-form-field appearance="outline">
                  <mat-label>From</mat-label>
                  <input matInput [matDatepicker]="fromPicker" [min]="today"
                         [(ngModel)]="dates[item.id].start">
                  <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>To</mat-label>
                  <input matInput [matDatepicker]="toPicker" [min]="dates[item.id].start ?? today"
                         [(ngModel)]="dates[item.id].end">
                  <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                </mat-form-field>
              </div>

              @if (cost(item) !== null) {
                <p class="cost">Estimated total: ₹{{ cost(item) }}</p>
              }

              <button mat-flat-button color="primary" class="full-width"
                      [disabled]="!canBook(item)" (click)="book(item)">
                Request booking
              </button>
            }
          </mat-card-content>
        </mat-card>
      } @empty {
        <mat-card class="empty">
          <mat-icon>search_off</mat-icon>
          <p>No equipment found in this category.</p>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .filter { min-width: 240px; }
    .avatar { background: #e3f2fd; color: #1565c0; border-radius: 50%; padding: 8px; box-sizing: border-box; }
    mat-card-content p:first-child { margin-top: 0; }
  `],
})
export class EquipmentListComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  readonly today = new Date();
  items: Equipment[] = [];
  category = '';
  dates: Record<number, { start: Date | null; end: Date | null }> = {};

  ngOnInit(): void {
    this.http.get<Equipment[]>('/api/equipment').subscribe(list => {
      this.items = list;
      for (const e of list) {
        this.dates[e.id] ??= { start: null, end: null };
      }
    });
  }

  categories(): string[] {
    return [...new Set(this.items.map(i => i.category))].sort();
  }

  visibleItems(): Equipment[] {
    return this.category ? this.items.filter(i => i.category === this.category) : this.items;
  }

  cost(item: Equipment): number | null {
    const d = this.dates[item.id];
    if (!d?.start || !d?.end || d.end < d.start) return null;
    const days = Math.round((d.end.getTime() - d.start.getTime()) / 86_400_000) + 1;
    return days * item.ratePerDay;
  }

  canBook(item: Equipment): boolean {
    return this.cost(item) !== null;
  }

  book(item: Equipment): void {
    const d = this.dates[item.id];
    this.http.post<Booking>('/api/bookings', {
      equipmentId: item.id,
      startDate: toIsoDate(d.start!),
      endDate: toIsoDate(d.end!),
    }).subscribe({
      next: b => {
        this.snack.open(`Requested ${item.name} (₹${b.totalCost}). Waiting for approval.`, 'Close', { duration: 4000 });
        this.dates[item.id] = { start: null, end: null };
      },
      error: err => this.snack.open(err.error?.error ?? 'Booking failed', 'Close', { duration: 4000 }),
    });
  }
} 