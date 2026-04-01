class Task:
    def __init__(self, name, duration, priority, difficulty, deadline):
        self.name = name
        self.duration = duration
        self.priority = priority
        self.difficulty = difficulty
        self.deadline = deadline

    def to_dict(self):
        return {
            "name": self.name,
            "duration": self.duration,
            "priority": self.priority,
            "difficulty": self.difficulty,
            "deadline": self.deadline
        }