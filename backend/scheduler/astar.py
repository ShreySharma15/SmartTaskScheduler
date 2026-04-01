import heapq
from backend.scheduler.state import State
from backend.scheduler.heuristic import heuristic


def run_astar(tasks):

    start_state = State([], tasks, 0)

    open_list = []

    heapq.heappush(open_list, (0, start_state))

    while open_list:

        _, current = heapq.heappop(open_list)

        if current.is_goal():
            return current.scheduled_tasks

        for task in current.remaining_tasks:

            new_scheduled = current.scheduled_tasks + [task]

            new_remaining = [
                t for t in current.remaining_tasks if t != task
            ]

            new_time = current.time_used + task["duration"]

            new_state = State(
                new_scheduled,
                new_remaining,
                new_time
            )

            g = new_time
            h = heuristic(new_remaining)

            f = g + h

            heapq.heappush(open_list, (f, new_state))

    return []