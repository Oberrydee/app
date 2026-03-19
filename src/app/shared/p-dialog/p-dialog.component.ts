import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'p-dialog',
  templateUrl: './p-dialog.component.html',
  styleUrls: ['./p-dialog.component.scss']
})
export class PDialogComponent {
  @Input() visible = false;
  @Input() header = '';
  @Input() modal = true;
  @Input() closable = true;
  @Input() styleClass = '';
  @Output() visibleChange = new EventEmitter<boolean>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible && this.closable) {
      this.close();
    }
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onMaskClick(): void {
    if (this.modal && this.closable) {
      this.close();
    }
  }
}
