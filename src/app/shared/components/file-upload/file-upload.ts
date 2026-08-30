import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  private readonly http = inject(HttpClient);

  @Input({ required: true }) uploadUrl!: string;
  @Input() accept = 'image/png,image/jpeg,image/webp,image/gif,application/pdf';
  @Output() uploaded = new EventEmitter<unknown>();

  readonly progress = signal<number | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.progress.set(0);

    this.http.post(this.uploadUrl, formData, { reportProgress: true, observe: 'events' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.progress.set(null);
          this.uploaded.emit(event.body);
        }
      },
      error: () => {
        this.progress.set(null);
      },
    });
  }
}