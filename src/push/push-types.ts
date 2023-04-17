export interface NotificationDate {
  date: string;
  wasEmpty: boolean;
  changedClasses: string[];
}

export interface NotificationBody {
  changedDates: NotificationDate[];
}

export interface SubstitutionNotificationData {
  type: 'substitution';
  tri: string;
  date: string;
}
