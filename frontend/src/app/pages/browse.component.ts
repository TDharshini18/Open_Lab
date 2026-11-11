import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Availability, Booking, Equipment } from '../core/models';
import { toIsoDate } from '../core/dates';
import { colorFor } from '../core/ui';

interface Slot {
  start: Date | null;
  end: Date | null;
  checking: boolean;
  result: Availability | null;
}

@Component({
  selector: 'app-browse',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule,
            MatInputModule, MatProgressSpinnerModule, MatSelectModule],
  template: `
    <section class="hero">
      <h1>Find lab equipment 🔬</h1>
      <p>Browse what approved colleges are sharing, check your dates, and send a request in seconds.</p>
    </section>

    <div class="stats">
      <div class="stat">
        <span class="stat-emoji">🧰</span>
        <div><div class="stat-num">{{ items.length }}</div><div class="stat-label">Items to browse</div></div>
      </div>
      <div class="stat">
        <span class="stat-emoji">🏫</span>
        <div><div class="stat-num">{{ collegeCount() }}</div><div class="stat-label">Colleges sharing</div></div>
      </div>
      <div class="stat">
        <span class="stat-emoji">🏷️</span>
        <div><div class="stat-num">{{ categories().length }}</div><div class="stat-label">Categories</div></div>
      </div>
    </div>

    <div class="toolbar-row">
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

    @if (visibleItems().length) {
      <div class="grid">
        @for (item of visibleItems(); track item.id) {
          <mat-card class="item-card">
            <mat-card-header>
              <div mat-card-avatar class="avatar" [style.background]="color(item.category)">
                {{ item.name.charAt(0) }}
              </div>
              <mat-card-title>{{ item.name }}</mat-card-title>
              <mat-card-subtitle>🏫 {{ item.organizationName }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p>{{ item.description }}</p>
              <p class="muted">📍 {{ item.location }}</p>
              <p class="rate"><span class="tag">{{ item.category }}</span> <strong>₹{{ item.ratePerDay }}</strong> <span class="muted">/ day</span></p>

              <div class="dates">
                <mat-form-field appearance="outline">
                  <mat-label>From</mat-label>
                  <input matInput [matDatepicker]="fromPicker" [min]="today"
                         [(ngModel)]="slots[item.id].start" (dateChange)="resetCheck(item.id)">
                  <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>To</mat-label>
                  <input matInput [matDatepicker]="toPicker" [min]="slots[item.id].start ?? today"
                         [(ngModel)]="slots[item.id].end" (dateChange)="resetCheck(item.id)">
                  <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                </mat-form-field>
              </div>

              @if (slots[item.id].result; as r) {
                <p>
                  <span class="pill {{ r.available ? 'AVAILABLE' : 'REJECTED' }}">
                    {{ r.available ? '✅ Free for those dates' : '⛔ Not free' }}
                  </span>
                </p>
                <p class="muted">{{ r.message }}</p>
              }

              @if (cost(item) !== null) {
                <p class="cost">Estimated total: ₹{{ cost(item) }}</p>
              }

              <div class="actions">
                <button mat-stroked-button [disabled]="!canCheck(item)" (click)="check(item)">
                  @if (slots[item.id].checking) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    Check dates
                  }
                </button>
                <button mat-flat-button color="primary" [disabled]="!canRequest(item)" (click)="request(item)">
                  Send request
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    } @else {
      <div class="empty-state">
        <span class="emoji">🔬</span>
        <h3>Nothing here yet</h3>
        <p>No equipment matches this category. Try another one.</p>
      </div>
    }
  `,
  styles: [`
    .filter { min-width: 240px; }
    .actions { display: flex; gap: 8px; margin-top: 12px; }
    .rate { display: flex; align-items: center; gap: 8px; font-size: 16px; }
  `],
})
export class BrowseComponent implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  readonly today = new Date();
  items: Equipment[] = [];
  category = '';
  slots: Record<number, Slot> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Equipment[]>('/api/equipment').subscribe(list => {
      this.items = list;
      for (const e of list) {
        this.slots[e.id] ??= { start: null, end: null, checking: false, result: null };
      }
    });
  }

  categories(): string[] {
    return [...new Set(this.items.map(i => i.category))].sort();
  }

  visibleItems(): Equipment[] {
    return this.category ? this.items.filter(i => i.category === this.category) : this.items;
  }

  collegeCount(): number {
    return new Set(this.items.map(i => i.organizationId)).size;
  }

  color(category: string): string {
    return colorFor(category);
  }

  resetCheck(id: number): void {
    this.slots[id].result = null;
  }

  canCheck(item: Equipment): boolean {
    const s = this.slots[item.id];
    return !!s.start && !!s.end && s.end >= s.start && !s.checking;
  }

  check(item: Equipment): void {
    const s = this.slots[item.id];
    s.checking = true;
    s.result = null;
    this.http.get<Availability>(`/api/equipment/${item.id}/availability`, {
      params: { from: toIsoDate(s.start!), to: toIsoDate(s.end!) },
    }).subscribe({
      next: r => {
        s.result = r;
        s.checking = false;
      },
      error: err => {
        s.checking = false;
        this.snack.open(err.error?.error ?? 'Could not check availability', 'Close', { duration: 4000 });
      },
    });
  }

  cost(item: Equipment): number | null {
    const s = this.slots[item.id];
    if (!s?.start || !s?.end || s.end < s.start) return null;
    const days = Math.round((s.end.getTime() - s.start.getTime()) / 86_400_000) + 1;
    return days * item.ratePerDay;
  }

  canRequest(item: Equipment): boolean {
    return this.slots[item.id].result?.available === true && this.cost(item) !== null;
  }

  request(item: Equipment): void {
    const s = this.slots[item.id];
    this.http.post<Booking>('/api/bookings', {
      equipmentId: item.id,
      startDate: toIsoDate(s.start!),
      endDate: toIsoDate(s.end!),
    }).subscribe({
      next: b => {
        this.snack.open(`🎉 Request sent to ${item.organizationName}. Total ₹${b.totalCost}.`, 'Nice', { duration: 5000 });
        this.slots[item.id] = { start: null, end: null, checking: false, result: null };
      },
      error: err => this.snack.open(err.error?.error ?? 'Request failed', 'Close', { duration: 4000 }),
    });
  }
}
