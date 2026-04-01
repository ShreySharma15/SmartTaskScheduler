from backend.scheduler.astar import run_astar
from backend.utils.time_utils import generate_time_schedule

def schedule_tasks(tasks, start_time, end_time):

    ordered_tasks = run_astar(tasks)

    schedule = generate_time_schedule(
        ordered_tasks,
        start_time,
        end_time
    )

    return schedule