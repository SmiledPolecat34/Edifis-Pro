import apiService from "./apiService";

interface TimesheetResponse {
  message: string;
  timesheet: {
    timesheet_id: number;
    user_id: number;
    start_date: string;
    end_date: string | null;
  };
}

interface ActiveTimesheetResponse {
  active: boolean;
}

const timesheetService = {
  clockIn: async (userId: number): Promise<TimesheetResponse> => {
    return apiService.post("/timesheets/clockin", { userId });
  },
  clockOut: async (userId: number): Promise<TimesheetResponse> => {
    return apiService.post("/timesheets/clockout", { userId });
  },
  getActiveTimesheet: async (
    userId: number
  ): Promise<ActiveTimesheetResponse> => {
    return apiService.get(`/timesheets/active/${userId}`);
  },
};

export default timesheetService;
