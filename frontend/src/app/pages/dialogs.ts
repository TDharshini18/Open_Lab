import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Equipment, UnavailablePeriod } from '../core/models';
import { toIsoDate } from '../core/dates';

/** Lets a college block out date ranges for one item (maintenance, repairs, etc.). */
@Component({
  selector: 'app-unavailable-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatDatepickerModule,
            MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>🗓️ Unavailable dates</h2>
    <mat-dialog-content>
      <p class="muted">{{ data.name }}</p>

      <h3 class="section-title">Blocked periods</h3>
      @if (periods().length) {
        <ul class="periods">
          @for (p of periods(); track p.id) {
            <li>
              <span class="pill REJECTED">{{ p.startDate }} → {{ p.endDate }}</span>
              @if (p.reason) { <span class="muted"> {{ p.reason }}</span> }
            </li>
          }
        </ul>
      } @else {
        <p class="muted">Nothing blocked. This item is free whenever it's not booked.</p>
      }

      <h3 class="section-title">Add a block</h3>
      <div class="dates">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input matInput [matDatepicker]="fromPicker" [min]="today" [(ngModel)]="start">
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>To</mat-label>
          <input matInput [matDatepicker]="toPicker" [min]="start ?? today" [(ngModel)]="end">
          <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Reason (optional)</mat-label>
        <input matInput [(ngModel)]="reason" placeholder="e.g. calibration, repairs, class use">
      </mat-form-field>

      @if (error()) {
        <p class="notice-error">⚠️ {{ error() }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Close</button>
      <button mat-flat-button color="primary" [disabled]="!start || !end" (click)="add()">
        <mat-icon>add</mat-icon> Block dates
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .section-title { font-size: 15px; margin: 16px 0 8px; }
    .periods { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .dates { display: flex; gap: 8px; }
    .dates mat-form-field { flex: 1; }
  `],
})
export class UnavailableDialogComponent {
  readonly data = inject<Equipment>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<UnavailableDialogComponent>);
  private http = inject(HttpClient);

  readonly today = new Date();
  periods = signal<UnavailablePeriod[]>([]);
  start: Date | null = null;
  end: Date | null = null;
  reason = '';
  error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<UnavailablePeriod[]>(`/api/equipment/${this.data.id}/unavailable`)
      .subscribe(list => this.periods.set(list));
  }

  add(): void {
    if (!this.start || !this.end) return;
    this.error.set('');
    this.http.post(`/api/equipment/${this.data.id}/unavailable`, {
      startDate: toIsoDate(this.start),
      endDate: toIsoDate(this.end),
      reason: this.reason,
    }).subscribe({
      next: () => {
        this.start = null;
        this.end = null;
        this.reason = '';
        this.load();
      },
      error: err => this.error.set(err.error?.error ?? 'Could not block those dates'),
    });
  }
}

export interface ConfirmData {
  title: string;
  message: string;
  confirmText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="ref.close(true)">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);
}
