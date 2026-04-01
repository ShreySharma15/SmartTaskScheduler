def generate_time_schedule(tasks, start_time, end_time):

    start_hour = int(start_time)
    end_hour = int(end_time)

    current_time = start_hour

    schedule = []

    for task in tasks:

        duration = task["duration"]

        if current_time + duration > end_hour:
            break

        start = current_time
        end = start + duration

        schedule.append({
            "task": task["name"],
            "start": f"{start}:00",
            "end": f"{end}:00"
        })

        current_time = end

    return schedule