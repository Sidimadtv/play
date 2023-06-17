import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { EPG_FETCH } from '../../../shared/ipc-commands';
import { setEpgAvailableFlag } from '../state/actions';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root',
})
export class EpgService {
    /** Default options for epg snackbar notifications */
    epgSnackBarOptions: MatSnackBarConfig = {
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
    };

    constructor(
        private readonly store: Store,
        private electronService: DataService,
        private snackBar: MatSnackBar,
        private translate: TranslateService
    ) {}

   
    /**
     * Handles the event when the EPG fetching is done
     */
    onEpgFetchDone(): void {
        this.store.dispatch(setEpgAvailableFlag({ value: true }));
        this.snackBar.open(
            this.translate.instant('EPG.DOWNLOAD_SUCCESS'),
            null,
            {
                ...this.epgSnackBarOptions,
                duration: 2000,
            }
        );
    }

    /**
     * Handles epg error
     */
    onEpgError(): void {
        this.snackBar.open(this.translate.instant('EPG.ERROR'), null, {
            ...this.epgSnackBarOptions,
            duration: 2000,
        });
    }
}
