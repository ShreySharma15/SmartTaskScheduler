import json
from backend.scheduler.scheduler import schedule_tasks


def main():

    print("\nAI Smart Task Scheduler\n")

    start_time = input("Enter study start hour (example: 16): ")
    end_time = input("Enter study end hour (example: 20): ")

    with open("backend/data/sample_tasks.json") as file:
        tasks = json.load(file)

    schedule = schedule_tasks(tasks, start_time, end_time)

    print("\nOptimal Study Schedule:\n")

    for s in schedule:
        print(f"{s['start']} - {s['end']}  ->  {s['task']}")


if __name__ == "__main__":
    main()