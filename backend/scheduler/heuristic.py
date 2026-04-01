priority_weight = {
    "high": 1,
    "medium": 2,
    "low": 3
}


def heuristic(remaining_tasks):

    cost = 0

    for task in remaining_tasks:

        weight = priority_weight.get(task["priority"].lower(), 2)

        cost += task["duration"] * weight

    return cost