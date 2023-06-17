import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [MatIconModule, TranslateModule],
    template: `
        <div mat-dialog-content>
            <img src="./assets/icons/icon-tv-256.png" width="128" /><br />
            <h2 mat-dialog-title>{{ 'ABOUT.TITLE' | translate }}</h2>
            <p>{{ 'ABOUT.DESCRIPTION' | translate }}</p>
            
            
        </div>
    `,
    styles: [
        `
            button {
                text-transform: uppercase;
            }

            a {
                color: #fff;
            }

            .mat-icon {
                font-size: 32px;
            }
        `,
    ],
})
export class AboutDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public appVersion: string) {}
}
