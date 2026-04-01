class State:

    def __init__(self, scheduled_tasks, remaining_tasks, time_used):
        self.scheduled_tasks = scheduled_tasks
        self.remaining_tasks = remaining_tasks
        self.time_used = time_used

    def is_goal(self):
        return len(self.remaining_tasks) == 0