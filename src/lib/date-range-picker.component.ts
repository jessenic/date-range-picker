/**
 * date-range-picker.component
 */

import {
    Component, ElementRef, EventEmitter, HostListener, Input, OnInit,
    Output
} from '@angular/core';
import * as dateFns from 'date-fns';

export interface IDateRange {
    from: Date;
    to: Date;
}

export interface IDateRangePickerTexts {
    startLabel: string;
    endLabel: string;
    thisMonth: string;
    lastMonth: string;
    thisWeek: string;
    lastWeek: string;
    thisYear: string;
    lastYear: string;
}

@Component({
    selector: 'app-date-range',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent implements OnInit {

    public opened: false | 'from' | 'to';
    public range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly';
    public moment: Date;
    public dayNames: string[];
    public dates: Date[];
    @Input() public themeColor: 'green' | 'teal' | 'grape' | 'red' | 'gray';
    @Input() private fromDate: Date;
    @Input() private toDate: Date;
    @Input() texts: IDateRangePickerTexts;
    @Output() private dateRangeChange = new EventEmitter<IDateRange>();

    constructor(private elementRef: ElementRef) {
    }

    public ngOnInit() {
        this.opened = false;
        this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (this.fromDate &&
            this.toDate) {
            this.moment = new Date(this.fromDate);
            this.generateCalendar();
        } else {
            this.selectRange('tw');
        }

        if (this.texts == null) {
            this.texts = {
                startLabel: "Start",
                endLabel: "End",
                thisMonth: "This month",
                lastMonth: "Last month",
                thisWeek: "This week",
                lastWeek: "Last week",
                thisYear: "This year",
                lastYear: "Last year"
            };
        }
    }

    public toggleCalendar(selection: false | 'from' | 'to'): void {
        if (this.opened && this.opened !== selection) {
            this.opened = selection;
        } else {
            this.opened = this.opened ? false : selection;
        }
        if (selection) {
            var selDate = this.fromDate;
            if (selection == "to") {
                selDate = this.toDate;
            }
            let diffMonths = dateFns.differenceInCalendarMonths(
                selDate, this.moment);

            if (diffMonths !== 0) {
                this.moment = dateFns.addMonths(this.moment, diffMonths);
                this.generateCalendar();
            }
        }
    }

    public selectRange(range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly'): void {
        let today = dateFns.startOfDay(new Date());

        switch (range) {
            case 'lm':
                today = dateFns.subMonths(today, 1);
            case 'tm':
                this.fromDate = dateFns.startOfMonth(today);
                this.toDate = dateFns.endOfMonth(today);

                break;
            case 'lw':
                today = dateFns.subWeeks(today, 1);
            default:
            case 'tw':
                this.fromDate = dateFns.startOfWeek(today);
                this.toDate = dateFns.endOfWeek(today);
                break;
            case 'ly':
                today = dateFns.subYears(today, 1);
            case 'ty':
                this.fromDate = dateFns.startOfYear(today);
                this.toDate = dateFns.endOfYear(today);
                break;
        }

        this.range = range;
        this.moment = new Date(this.fromDate);
        this.generateCalendar();
        this.emitChange();
    }

    public generateCalendar(): void {
        this.dates = [];
        let firstDate = dateFns.startOfMonth(this.moment);
        let start = 0 - (dateFns.getDay(firstDate) + 7) % 7;
        let end = 41 + start; // iterator ending point

        for (let i = start; i <= end; i += 1) {
            let day = dateFns.addDays(firstDate, i);
            this.dates.push(day);
        }
    }

    public selectDate(date: Date): void {

        if (this.opened === 'from') {
            this.fromDate = date;
            if (this.toDate &&
                dateFns.compareDesc(date, this.toDate) < 1) {
                this.toDate = null;
            }
        }

        if (this.opened === 'to') {
            this.toDate = date;
            if (this.fromDate &&
                dateFns.compareAsc(date, this.fromDate) < 1) {
                this.fromDate = null;
            }
        }
        this.emitChange();

        /*let diffMonths = dateFns.differenceInCalendarMonths(date, this.moment);
    
        if (diffMonths !== 0) {
            this.moment = dateFns.addMonths(this.moment, diffMonths);
            this.generateCalendar();
        }*/
    }

    private emitChange(): void {
        this.dateRangeChange.emit({ to: this.toDate, from: this.fromDate });
    }

    private updateRange(): void {

    }

    public prevMonth(): void {
        this.moment = dateFns.addMonths(this.moment, -1);
        this.generateCalendar();
    }

    public nextMonth(): void {
        this.moment = dateFns.addMonths(this.moment, 1);
        this.generateCalendar();
    }

    public isWithinRange(day: Date): boolean {
        return this.fromDate && this.toDate
            && dateFns.isWithinRange(day, this.fromDate, this.toDate);
    }

    public isDateRangeFrom(day: Date): boolean {
        return dateFns.isSameDay(day, this.fromDate);
    }

    public isDateRangeTo(day: Date): boolean {
        return dateFns.isSameDay(day, this.toDate);
    }

    @HostListener('document:click', ['$event'])
    private handleBlurClick(e: MouseEvent) {
        let target = e.srcElement || e.target;
        if (!this.elementRef.nativeElement.contains(e.target)
            && !(<Element>target).classList.contains('yk-day-num')) {
            this.opened = false;
        }
    }
}
