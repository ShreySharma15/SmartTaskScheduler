let nextTaskId = 4;

const tasks = [
  { id: 1, name: "Revise Data Structures", priority: "High", difficulty: "Hard" },
  { id: 2, name: "Practice A* Search Problems", priority: "Medium", difficulty: "Medium" },
  { id: 3, name: "Read Operating Systems Notes", priority: "Low", difficulty: "Easy" }
];

const priorityOrder = {
  High: 3,
  Medium: 2,
  Low: 1
};

const taskList = document.getElementById("taskList");
const scheduleList = document.getElementById("scheduleList");
const taskCount = document.getElementById("taskCount");
const totalTimeDisplay = document.getElementById("totalTimeDisplay");
const outputPanel = document.querySelector(".output-panel");

const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const taskNameInput = document.getElementById("taskName");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDifficultyInput = document.getElementById("taskDifficulty");
const addTaskBtn = document.getElementById("addTaskBtn");
const generateBtn = document.getElementById("generateBtn");
const generateBtnDefaultText = generateBtn ? generateBtn.textContent : "Generate Optimal Schedule";
let lastAddedTaskIndex = null;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function difficultyClass(difficulty) {
  return `difficulty-${difficulty.toLowerCase()}`;
}

function formatTotalTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return "0h 0m";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatAllocatedDuration(startMinutes, endMinutes) {
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
    return "0h 0m";
  }

  return formatTotalTime(endMinutes - startMinutes);
}

function getAvailableTime() {
  const startTimeValue = startTimeInput ? startTimeInput.value : "";
  const endTimeValue = endTimeInput ? endTimeInput.value : "";
  const startMinutes = parseTime(startTimeValue);
  const endMinutes = parseTime(endTimeValue);

  console.debug("Scheduler time inputs:", {
    startTime: startTimeValue,
    endTime: endTimeValue,
    parsedStartTime: startMinutes,
    parsedEndTime: endMinutes
  });

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return { error: "Please enter valid start and end time." };
  }

  if (endMinutes <= startMinutes) {
    return { error: "Choose an end time later than the start time to generate a schedule." };
  }

  return {
    startMinutes,
    endMinutes,
    totalMinutes: endMinutes - startMinutes
  };
}

function validateScheduleGeneration() {
  if (!tasks.length) {
    return { error: "Please add at least one task" };
  }

  const availableTime = getAvailableTime();

  if (availableTime.error) {
    return { error: availableTime.error };
  }

  return { availableTime };
}

function scrollToSchedule() {
  if (!outputPanel) {
    return;
  }

  outputPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function taskWeight(task) {
  const priorityWeights = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const difficultyWeights = {
    Hard: 3,
    Medium: 2,
    Easy: 1
  };

  return (priorityWeights[task.priority] || 1) + (difficultyWeights[task.difficulty] || 1);
}

function buildScheduleSlots(taskItems, totalMinutes, startMinutes) {
  const safeTotalMinutes = Math.max(0, Math.floor(totalMinutes));
  const weights = taskItems.map(taskWeight);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const minimumPerTask = safeTotalMinutes >= taskItems.length * 30 ? 30 : 0;
  let remainingMinutes = safeTotalMinutes - (minimumPerTask * taskItems.length);

  if (remainingMinutes < 0) {
    remainingMinutes = 0;
  }

  const provisional = taskItems.map((task, index) => {
    const exactShare = weightSum > 0 ? (remainingMinutes * weights[index]) / weightSum : 0;
    const extraMinutes = Math.floor(exactShare);

    return {
      task,
      minutes: minimumPerTask + extraMinutes,
      remainder: exactShare - extraMinutes
    };
  });

  let allocatedMinutes = provisional.reduce((sum, item) => sum + item.minutes, 0);
  let leftover = safeTotalMinutes - allocatedMinutes;

  while (leftover > 0 && provisional.length) {
    provisional.sort((a, b) => b.remainder - a.remainder);

    for (const item of provisional) {
      if (leftover <= 0) {
        break;
      }

      item.minutes += 1;
      leftover -= 1;
    }
  }

  let pointer = startMinutes;

  return provisional
    .sort((a, b) => {
      return taskItems.findIndex((task) => task.id === a.task.id) - taskItems.findIndex((task) => task.id === b.task.id);
    })
    .map((item) => {
      const slotStart = pointer;
      const slotEnd = pointer + item.minutes;
      pointer = slotEnd;

      return {
        ...item.task,
        slotStart,
        slotEnd
      };
    });
}

function renderTasks() {
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  if (!tasks.length) {
    taskList.innerHTML = '<li class="empty-state">No tasks added yet. Start by adding one above.</li>';
    return;
  }

  taskList.innerHTML = tasks.map((task, index) => `
    <li class="task-item ${index === lastAddedTaskIndex ? "is-new" : ""}" style="animation-delay: ${index * 60}ms;" data-task-id="${task.id}">
      <div class="task-item-top">
        <div class="task-main">
          <div class="task-title-row">
            <p class="task-name">${task.name}</p>
          </div>
        </div>
        <div class="task-actions">
          <div class="task-badge-group">
            <span class="priority-badge ${priorityClass(task.priority)}">${task.priority}</span>
            <span class="difficulty-badge ${difficultyClass(task.difficulty)}">${task.difficulty}</span>
          </div>
          <button class="delete-task-btn" type="button" data-delete-id="${task.id}" aria-label="Delete ${task.name}">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 4.5h6m-9 3h12m-1 0-.52 9.12A2 2 0 0 1 14.48 18.5h-4.96a2 2 0 0 1-1.99-1.88L7 7.5m3 3.5v4m4-4v4M10 4.5l.34-.94A1 1 0 0 1 11.28 3h1.44a1 1 0 0 1 .94.66L14 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </li>
  `).join("");

  if (lastAddedTaskIndex !== null) {
    window.setTimeout(() => {
      const newestTask = taskList.querySelector(".task-item.is-new");
      if (newestTask) {
        newestTask.classList.remove("is-new");
      }
      lastAddedTaskIndex = null;
    }, 520);
  }
}

function renderSchedule() {
  const validation = validateScheduleGeneration();

  if (totalTimeDisplay) {
    totalTimeDisplay.textContent = validation.error
      ? ""
      : `Total Time: ${formatTotalTime(validation.availableTime.totalMinutes)}`;
  }

  if (validation.error) {
    scheduleList.innerHTML = `<li class="empty-state">${validation.error}</li>`;
    return;
  }

  const { availableTime } = validation;

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityDelta = priorityOrder[b.priority] - priorityOrder[a.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return taskWeight(b) - taskWeight(a);
  });
  const scheduledTasks = buildScheduleSlots(sortedTasks, availableTime.totalMinutes, availableTime.startMinutes);
  const scheduleMarkup = scheduledTasks.map((task, index) => `
    <li class="schedule-item is-new" style="animation-delay: ${index * 90}ms;">
      <div class="schedule-item-top">
        <div>
          <p class="schedule-name">${task.name}</p>
          <div class="schedule-meta">
            <span>⏰ ${minutesToTime(task.slotStart)} - ${minutesToTime(task.slotEnd)} (${formatAllocatedDuration(task.slotStart, task.slotEnd)})</span>
          </div>
        </div>
        <div class="task-badge-group">
          <span class="priority-badge ${priorityClass(task.priority)}">${task.priority}</span>
          <span class="difficulty-badge ${difficultyClass(task.difficulty)}">${task.difficulty}</span>
        </div>
      </div>
    </li>
  `).join("");

  scheduleList.innerHTML = scheduleMarkup || '<li class="empty-state">No schedule available yet.</li>';
}

function parseTime(value) {
  if (typeof value !== "string" || !timePattern.test(value)) {
    return null;
  }

  const timeParts = value.split(":");

  if (timeParts.length !== 2) {
    return null;
  }

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) {
    return "00:00";
  }

  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addTask() {
  const name = taskNameInput.value.trim();
  const priority = taskPriorityInput.value;
  const difficulty = taskDifficultyInput.value;

  if (!name) {
    taskNameInput.focus();
    return;
  }

  tasks.push({ id: nextTaskId++, name, priority, difficulty });
  lastAddedTaskIndex = tasks.length - 1;
  taskNameInput.value = "";
  taskPriorityInput.value = "Medium";
  taskDifficultyInput.value = "Medium";

  addTaskBtn.classList.add("is-success");
  renderTasks();
  window.setTimeout(() => {
    addTaskBtn.classList.remove("is-success");
  }, 520);
}

function deleteTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return;
  }

  const taskElement = taskList.querySelector(`[data-task-id="${taskId}"]`);

  if (!taskElement) {
    tasks.splice(taskIndex, 1);
    renderTasks();
    renderSchedule();
    return;
  }

  taskElement.classList.add("is-removing");

  window.setTimeout(() => {
    tasks.splice(taskIndex, 1);
    renderTasks();
    renderSchedule();
  }, 280);
}

addTaskBtn.addEventListener("click", addTask);

taskList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");

  if (!deleteButton) {
    return;
  }

  const taskId = Number(deleteButton.dataset.deleteId);
  deleteTask(taskId);
});

generateBtn.addEventListener("click", () => {
  const validation = validateScheduleGeneration();

  if (validation.error) {
    if (totalTimeDisplay) {
      totalTimeDisplay.textContent = "";
    }

    scheduleList.innerHTML = `<li class="empty-state">${validation.error}</li>`;
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  generateBtn.classList.add("is-busy", "is-loading");

  window.setTimeout(() => {
    renderSchedule();
    scrollToSchedule();
    generateBtn.disabled = false;
    generateBtn.textContent = generateBtnDefaultText;
    generateBtn.classList.remove("is-busy", "is-loading");
  }, 700);
});

[startTimeInput, endTimeInput].forEach((input) => {
  input.addEventListener("change", renderSchedule);
});

taskNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

renderTasks();
renderSchedule();
