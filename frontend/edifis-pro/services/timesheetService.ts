import apiService from "./apiService";

export interface TimesheetResponse {
  message: string;
  timesheet: {
    timesheet_id: number;
    user_id: number;
    start_date: string;
    end_date: string | null;
  };
}

export interface ActiveTimesheetResponse {
  active: boolean;
  timesheet?: {
    timesheet_id: number;
    user_id: number;
    start_date: string;
    end_date: string | null;
  };
}

const timesheetService = {
  clockIn: (userId: number): Promise<TimesheetResponse> =>
    apiService.post("/timesheets/clockin", { userId }),

  clockOut: (userId: number): Promise<TimesheetResponse> =>
    apiService.post("/timesheets/clockout", { userId }),

  getActiveTimesheet: (userId: number): Promise<ActiveTimesheetResponse> =>
    apiService.get(`/timesheets/active/${userId}`),
};

export default timesheetService;
