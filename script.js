console.log("Todo Manager");
// ---- CONSTANTS / DOM REFERENCES ----
// Keys for Local Storage
const KEYS = {
  TASKS: "TasksList",
  TAGS: "TagsList",
};

// Classes Used Commmonly
const CLASSES = {
  TASK_COMPLETED: "task-completed",
  TAG_ITEM: "tag-item",
  FILTER_DROPDOWN: "filter-dropdown",
  HAMBURGER_CHANGE: "hamburger-change",
  HAMBURGER_RESET: "hamburger-reset",
};

// For PopUps / Notifications
const infoDiv = document.querySelector(".info-div");

// To Add New Task
const addNewTaskBtn = document.querySelector(".add-new-task-btn");
// For User Input
const taskUserInput = document.querySelector(".task-input-container");
// Task List
const tasksContainer = document.querySelector(".tasks-list-container");
// Task Input Variables
const taskTitle = document.querySelector(".task-title");
//Task Date
const taskDate = document.querySelector(".task-date");

// Getting Today Date
const today = new Date().toISOString().split("T")[0];
// Setting Today as Min So Previous Dates Can't Accessible
taskDate.setAttribute("min", today);

// Add Task Button after Getting Details from User in Input Container
const addTask = document.querySelector(".add-task-btn");
// Cancel Task Button
const cancelTask = document.querySelector(".cancel-task-btn");

// Add Tag Input Field in SideBar
const addTagBtn = document.querySelector(".add-tag-btn");
// Cancel Tag Input Field
const cancelTagBtn = document.querySelector(".cancel-tag-btn");
// Tag Input Container
const tagInputContainer = document.querySelector(".tag-input-container");
// Tag Input Feild
const tagInputField = tagInputContainer.querySelector(".tag-input");
// Add New Tag
const sendTagBtn = document.querySelector(".send-tag-list-btn");
// Tags List on SideBar Menu/Left Container
const tagsList = document.querySelector(".tags-list");

// Tags Showing in Input Container - Right Container
const showTagsBtn = document.querySelector(".show-tag-list-btn");
// Refresh Tags/Update Tags
const updateTagButton = document.querySelector(".update-input-tag");
// Tag List in Input Container
const tagInputList = document.querySelector(".tags-details-list");
// Tag Names in Input Container
const selectedTag = document.querySelector(".selected-tags");

// Search Tasks
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");

// Filter by Status
const statusFilter = document.querySelector(".status-filter");
const statusFilterOptions = document.querySelector(".status-filter-options");
// Filter by Tag Name
const tagFilter = document.querySelector(".tag-filter");
const tagFilterOptions = document.querySelector(".tag-filter-options");
// Filter by Type like Today/Upcoming
const tasksListFilter = document.querySelector(".tasks-list");

// Hamburger Management
const hamburgerIcon = document.querySelector(".hamburger-icon span");
const taskMain = document.querySelector(".task-main-container");
const taskMenu = document.querySelector(".task-menu-container");
const hamburgerToggle = document.querySelector(".hamburger-toggle span");

// ----   STATE VARIABLES ----

// To Save Tasks
let taskList = [];
// For Checking Task Completion
let isCompleted = false;
// For Task Editing
let editingTaskId = null;
// For Tasks Filteration
let filteredTasks = [...taskList];

// To Save Tags
let tagList = [];

// For Drag & Drop Feature
let draggedTaskId = null;

// ----   UTILITY FUNCTIONS ----

// Id Generator for Tasks ID
const createIdGenerator = () => {
  let index = 0;
  return () => {
    index += 1;
    return index;
  };
};
const generateId = createIdGenerator();

// Color Genertaor for Tags
const colorGenerator = () => {
  const hexChar = "0123456789abcdef";
  const result = [];

  for (let i = 0; i <= 5; i++) {
    const randomChar = hexChar[Math.floor(Math.random() * hexChar.length)];
    result.push(randomChar);
  }
  let hexCode = `#${result.join("")}`;
  return hexCode;
};

// Toggle Task Input Container and Task List
const showTaskInput = (val1, val2) => {
  taskUserInput.style.display = val1;
  tasksContainer.style.display = val2;
};

// Show Tag List in Input Container
const showTagList = (val1, val2) => {
  showTagsBtn.style.display = val1;
  updateTagButton.style.display = val2;
};

// Save Taks & Tags in Local Storage
const saveInLocalStorage = (list, key) => {
  localStorage.setItem(key, JSON.stringify(list));
};

// Get Taks & Tags from Local Storage
const getFromLocalStorage = (key) => {
  const getItem = localStorage.getItem(key);
  if (!getItem || getItem === "undefined") return [];

  return JSON.parse(getItem);
};

// For PopUps/Notifications
const toggleInfoDiv = (container, text) => {
  container.innerText = text;

  container.style.display = "block";
  setTimeout(() => {
    container.style.display = "none";
  }, 2000);
};

// Retrieving Tasks & Tags from Local Storage
const retriveData = () => {
  taskList = getFromLocalStorage(KEYS.TASKS);
  if (taskList.length > 0) {
    renderTasks(taskList);
  }

  tagList = getFromLocalStorage(KEYS.TAGS);
  if (tagList.length > 0) {
    renderSidebarTags();
  }

  // On Content Load Enable or Disable Mobile View
  checkViewPort();
};

// ----   CORE FUNCTIONS ----

// --Tasks Management--
// Open Task Input Container
const openTaskInputContainer = () => {
  taskTitle.value = "";
  selectedTag.innerText = "";
  tagInputList.style.display = "none";
  taskDate.value = "";
  taskTitle.focus();
  showTagList("flex", "none");
};

// Validating Empty Fields in Input Container
const validateTask = (title, tag, date) => {
  if (!title && !tag && !date) return "Add Task Name, Select Tag & Due Date";
  if (!title && !tag) return "Add Task Name & Select Tag from List";
  if (!title && !date) return "Add Task Name & Select Due Date";
  if (!tag && !date) return "Select Tag & Due Date";
  if (!title) return "Add Task Name";
  if (!tag) return "Select Tag from List";
  if (!date) return "Select Due Date";
  return null;
};

// Add task in Task List Array
const handleTaskInput = () => {
  //  Checking Empty Fields in Input Container
  const taskTitleText = taskTitle.value.trim();
  const taskDueDate = taskDate.value;

  const errorMsg = validateTask(
    taskTitleText,
    selectedTag.innerText,
    taskDueDate
  );

  if (errorMsg) {
    toggleInfoDiv(infoDiv, errorMsg);
    return;
  }

  if (editingTaskId) {
    const index = taskList.findIndex((t) => t.Id === editingTaskId);
    if (index !== -1) {
      taskList[index].Title = taskTitleText;
      taskList[index].Tag = selectedTag.innerText;
      taskList[index].DueDate = taskDueDate;
    }
    editingTaskId = null;
    addTask.innerText = "Add";
  } else {
    const taskDetails = {
      Id: generateId(),
      Title: taskTitleText,
      Tag: selectedTag.innerText,
      DueDate: taskDueDate,
      isCompleted: isCompleted,
    };

    taskList.push(taskDetails);
  }
  renderTasks(taskList);
};

// Render Task List
const renderTasks = (tasks = taskList) => {
  tasksContainer.innerHTML = "";

  tasks.forEach((task) => {
    const taskDiv = document.createElement("li");
    taskDiv.className = "task-details";
    taskDiv.innerHTML = `
      
        <input
          type="checkbox"
          class="task-checkbox"
          name="checkbox"
          ${task.isCompleted ? "checked" : ""}
        />
        <div class="task-container">
          <div class="task-content">
            <h5 class="task-name ${
              task.isCompleted ? CLASSES.TASK_COMPLETED : ""
            }">${task.Title}</h5>

            <div class="task-extra">
              <div class="task-tag-date">
             <span class="material-symbols-outlined"> shoppingmode </span>
              <h5 class="task-tag">${task.Tag}</h5>
              </div>
              <div class="task-tag-date">
              <span class="material-symbols-outlined">calendar_month</span>
              <h5 class="task-due-date">${task.DueDate}</h5>
              </div>
              
            </div>
          </div>

          <div class="action-btns">
            <button class="action-btn edit-btn">
              <span class="material-symbols-outlined"> edit </span>
            </button>
            <button class="action-btn del-btn">
              <span class="material-symbols-outlined"> delete </span>
            </button>
          </div>
        </div>
      
    `;

    taskDiv.dataset.id = task.Id;
    tasksContainer.append(taskDiv);

    // For Drag & Drop Functionalities
    taskDiv.setAttribute("draggable", "true");
    taskDiv.addEventListener("dragstart", onDragStart);
    taskDiv.addEventListener("dragover", onDragOver);
    taskDiv.addEventListener("dragleave", onDragLeave);
    taskDiv.addEventListener("drop", onDrop);
    taskDiv.addEventListener("dragend", onDragEnd);

    // To Toggle Input Container
    showTaskInput("none", "flex");
  });
};

// Actions on Tasks like Completed, Edit & Delete Task
const taskActions = (e) => {
  const taskEl = e.target.closest(".task-details");
  if (!taskEl) return;
  const taskId = taskEl.dataset.id;
  const task = taskList.find((t) => t.Id == taskId);

  const taskName = taskEl.querySelector(".task-name");

  if (e.target.closest(".task-checkbox")) {
    task.isCompleted = e.target.checked;
    task.isCompleted
      ? taskName.classList.add(CLASSES.TASK_COMPLETED)
      : taskName.classList.remove(CLASSES.TASK_COMPLETED);
    saveInLocalStorage(taskList, KEYS.TASKS);
  }

  if (e.target.closest(".action-btn.del-btn")) {
    taskList = taskList.filter((t) => t.Id !== Number(taskId));
    renderTasks(taskList);
    saveInLocalStorage(taskList, KEYS.TASKS);
  }

  if (e.target.closest(".action-btn.edit-btn")) {
    showTaskInput("flex", "none");

    addTask.innerText = "Update";
    editingTaskId = task.Id;
    taskTitle.value = task.Title;
    taskDate.value = task.DueDate;
    selectedTag.innerText = task.Tag || "";

    saveInLocalStorage(taskList, KEYS.TASKS);
  }
};

// --Tags Management--

const toggleInputField = () => {
  if (tagsList.children.length >= 0) {
    const tagTooltip = document.querySelector("#tag-tooltip");
    const addBtn = addTagBtn.querySelector("span");
    tagInputContainer.classList.toggle("toggle-input-container");
    tagInputField.focus();

    if (tagInputContainer.classList.contains("toggle-input-container")) {
      tagTooltip.innerText = "Cancel";
      addBtn.innerText = "close";
      tagInputField.value = "";
    } else {
      tagTooltip.innerText = "Add Tag";
      addBtn.innerText = "add";
    }
  }
};
// Function to Add Tags in Tags List
const handleTagInput = () => {
  const captilizeTag =
    tagInputField.value.charAt(0).toUpperCase() + tagInputField.value.slice(1);

  const tagValue = captilizeTag.trim();

  const tagListInput = {
    TagName: tagValue,
    Color: colorGenerator(),
  };

  if (tagValue === "") {
    toggleInfoDiv(infoDiv, "Enter Tag Name");
    tagInputField.focus();
  } else if (tagList.some((t) => t.TagName === tagValue)) {
    toggleInfoDiv(infoDiv, "Tag already exist");
    tagInputField.focus();
  } else {
    tagList.push(tagListInput);
    renderSidebarTags();
    resetTagInput();
  }
};

// Render Tags after User Add them in Tags List
const renderSidebarTags = () => {
  tagsList.innerHTML = "";
  tagList.forEach((tag) => {
    const tagName = document.createElement("li");
    tagName.className = CLASSES.TAG_ITEM;
    tagName.innerHTML = `<div class="tag-box-name">
    <span class="tag-box"></span>
    <span class="tag-name">${tag.TagName}</span>
    </div>
    <div class="del-tag-btn"><span class="material-symbols-outlined">delete</span>
    </div>
    
    `;
    tagName.querySelector(".tag-box").style.backgroundColor = tag.Color;
    tagsList.appendChild(tagName);

    const delTagBtn = tagName.querySelector(".del-tag-btn");

    delTagBtn.addEventListener("click", () => {
      let delTagName = tag.TagName;

      const inUseTag = taskList.some((t) => t.Tag === delTagName);
      inUseTag
        ? toggleInfoDiv(infoDiv, "Tag is in use, can't delete")
        : ((tagList = tagList.filter((t) => t.TagName !== delTagName)),
          tagName.remove(),
          saveInLocalStorage(tagList, KEYS.TAGS));
    });
  });
};

// Reset Tag Input Container & Field
const resetTagInput = () => {
  tagInputField.value = "";
  tagInputContainer.classList.toggle("toggle-input-container");
  document.querySelector("#tag-tooltip").innerText = "Add Tag";
  addTagBtn.querySelector("span").innerText = "add";
};

// Right Container - Input Container
// Render Tags from Tag List in Input Container
const renderTagList = (container) => {
  if (!container) return;

  if (tagList.length === 0) {
    toggleInfoDiv(infoDiv, "Add Tags in Tags List");
    container.style.display = "none";
  } else {
    container.innerHTML = "<span>Tags List:</span>";

    tagList.forEach((tag) => {
      const tagLi = document.createElement("li");
      tagLi.className = "tag-name-input";
      tagLi.innerHTML = `
      <span class="tag-box"></span>
      <span class="tag-list-name">${tag.TagName}</span>
      `;

      const tagBox = tagLi.querySelector(".tag-box");
      tagBox.style.backgroundColor = tag.Color;
      container.append(tagLi);
    });
    container.style.display = "flex";
  }
};

// Select Tags from Tags List
const selectTag = (e) => {
  if (
    e.target.className === "tag-name-input" ||
    e.target.className === "tag-list-name"
  ) {
    selectedTag.style.display = "block";

    selectedTag.innerText = e.target.innerText;
  }
};

// --Tasks Search--

// Search Task by Task Name
const searchTask = () => {
  const searchValue = searchInput.value.trim().toLowerCase();

  const allTask = tasksContainer.querySelectorAll(".task-details");

  let found = false;

  allTask.forEach((task) => {
    const taskName = task.querySelector(".task-name").innerText.toLowerCase();

    if (taskName === searchValue) {
      task.classList.add("task-search");
      toggleInfoDiv(infoDiv, "Task Found!");

      found = true;

      setTimeout(() => {
        task.classList.remove("task-search");
        searchInput.value = "";
      }, 2000);
    }
  });

  if (!found) {
    toggleInfoDiv(infoDiv, "Task Not Found!");
    searchInput.value = "";
  }
};

// --Tasks Filteration--
// Filter Tasks by Status like Active or Completed
const filterByStatus = (e) => {
  if (e.target.className === "filter-option") {
    statusFilter.querySelector("h5").innerText = e.target.innerText;
    statusFilterOptions.classList.toggle(CLASSES.FILTER_DROPDOWN);
  }

  if (e.target.innerText === "All Tasks") {
    statusFilter.querySelector("h5").innerText = "Status";
    renderTasks(taskList);
  }

  if (e.target.innerText === "Active") {
    filteredTasks = taskList.filter((t) => t.isCompleted === false);
    renderTasks(filteredTasks);
  }

  if (e.target.innerText === "Completed") {
    filteredTasks = taskList.filter((t) => t.isCompleted === true);
    renderTasks(filteredTasks);
    console.log(taskList);
  }
};

// Showing Tags for Tasks Filteration
const showTagsforFilter = () => {
  tagFilterOptions.innerHTML = "";

  if (tagList.length === 0) {
    toggleInfoDiv(infoDiv, "Add Tags First for Filteration");
    tagFilter.querySelector("h5").innerText = "Tags";
  } else {
    const allTagsOption = document.createElement("li");
    allTagsOption.className = "filter-option";
    allTagsOption.innerText = "All Tags";
    tagFilterOptions.appendChild(allTagsOption);

    tagList.forEach((tag) => {
      const filterOption = document.createElement("li");
      filterOption.className = "filter-option";
      filterOption.innerText = tag.TagName;
      tagFilterOptions.appendChild(filterOption);
    });
    tagFilterOptions.classList.toggle(CLASSES.FILTER_DROPDOWN);
  }
};

// Filter Tasks by Tag Names
const filterByTags = (e) => {
  if (e.target.className === "filter-option") {
    let tagOption = tagFilter.querySelector("h5");

    if (e.target.innerText === "All Tags") {
      tagOption.innerText = "Tags";
      renderTasks(taskList);
    } else {
      tagOption.innerText = e.target.innerText;
      filteredTasks = taskList.filter((t) => t.Tag === e.target.innerText);
      renderTasks(filteredTasks);
    }

    tagFilterOptions.classList.toggle(CLASSES.FILTER_DROPDOWN);
  }
};

// Filter Task By Type like Today,Upcoming
const filterTasksByType = (e) => {
  const filterLi = e.target.closest(".task-filter");
  if (!filterLi) return;

  const taskFilterHeading = document.querySelector(".task-heading-right");

  if (filterLi.classList.contains("all-tasks-filter")) {
    taskList.length > 0
      ? ((taskFilterHeading.innerText = "Tasks"), renderTasks(taskList))
      : toggleInfoDiv(infoDiv, "Add Tasks First");
  } else if (filterLi.classList.contains("today-filter")) {
    filteredTasks = taskList.filter((t) => t.DueDate === today);

    taskList.length > 0
      ? ((taskFilterHeading.innerText = "Today"), renderTasks(filteredTasks))
      : toggleInfoDiv(infoDiv, "Add Tasks First");
  } else if (filterLi.classList.contains("upcoming-filter")) {
    filteredTasks = taskList.filter((t) => t.DueDate !== today);
    taskList.length > 0
      ? ((taskFilterHeading.innerText = "Upcoming"), renderTasks(filteredTasks))
      : toggleInfoDiv(infoDiv, "Add Tasks First");
  }

  if (filterLi && window.innerWidth <= 750) {
    closeMenu();
  }
};

// --Hamburger Menu--
// Open Hamburger Menu
const openMenu = () => {
  taskMenu.classList.add("hamburger-change");
  taskMenu.classList.remove("hamburger-reset");
  taskMain.style.gridTemplateColumns = "0fr 2fr";
  hamburgerToggle.style.display = "none";
};

// Close Hamburger Menu
const closeMenu = () => {
  taskMenu.classList.remove("hamburger-change");
  taskMenu.classList.add("hamburger-reset");
  taskMain.style.gridTemplateColumns = "0.1fr 2fr";
  hamburgerToggle.style.display = "block";
  hamburgerIcon.innerText = "close";
};

// Reset to Desktop Orientation
const resetToDesktop = () => {
  taskMenu.classList.remove("hamburger-change", "hamburger-reset");
  taskMain.style.gridTemplateColumns = "0.4fr 2fr";
  hamburgerToggle.style.display = "none";
  hamburgerIcon.innerText = "menu";
};

// Toggle Hamburger Menu
const toggleMenu = () => {
  taskMenu.classList.contains("hamburger-change") ? closeMenu() : openMenu();
};

// Enabling Mobile Menu by Adding Listners
const enableMobileMenu = () => {
  hamburgerIcon.addEventListener("click", toggleMenu);
  hamburgerToggle.addEventListener("click", openMenu);
};

// Disabling Mobile Menu by Removing Listners
const disableMobileMenu = () => {
  hamburgerIcon.removeEventListener("click", toggleMenu);
  hamburgerToggle.removeEventListener("click", closeMenu);
  resetToDesktop();
};

// Checking Screen Size for Mobile or Desktop View
const checkViewPort = () => {
  if (window.innerWidth <= 750) {
    enableMobileMenu();
  } else {
    disableMobileMenu();
  }
};

const matchM = window.matchMedia("(max-width: 750px)");

matchM.matches ? closeMenu() : resetToDesktop();

matchM.addEventListener("change", (e) => {
  e.matches ? closeMenu() : resetToDesktop();
});

// --Drag & Drop Tasks--
// When User Starts Dragging Task
const onDragStart = (e) => {
  draggedTaskId = Number(e.currentTarget.dataset.id);
  e.dataTransfer.setData("text/plain", String(draggedTaskId));
  e.dataTransfer.effectAllowed = "move";
  e.currentTarget.classList.add("dragging");
};

// When User Stop Dragging Task
const onDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drop-target");
};

// When User Leave Dragging Task
const onDragLeave = (e) => {
  e.currentTarget.classList.remove("drop-target");
};

// When User Drop Task after/before any Task
const onDrop = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("drop-target");

  const draggedId = Number(e.dataTransfer.getData("text/plain"));
  const targetId = Number(e.currentTarget.dataset.id);

  if (draggedId === targetId) return;

  const fromIndex = taskList.findIndex((t) => t.Id === draggedId);
  const toIndex = taskList.findIndex((t) => t.Id === targetId);
  if (fromIndex === -1 || toIndex === -1) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const insertAfter = e.clientY > rect.top + rect.height / 2;

  // Remove Dragged Item from Task List
  const [moved] = taskList.splice(fromIndex, 1);

  // Re-find  target index in the updated array
  const newTargetTask = taskList.findIndex((t) => t.Id === targetId);
  const insertIndex = insertAfter ? newTargetTask + 1 : newTargetTask;

  taskList.splice(insertIndex, 0, moved);

  saveInLocalStorage(taskList, KEYS.TASKS);
  renderTasks(taskList);
};

// When Dragging Ends
const onDragEnd = (e) => {
  e.currentTarget.classList.remove("dragging");
  draggedTaskId = null;
};

// ----   EVENT LISTENERS ----

// --Tasks--
// For Opening Task Input Container
addNewTaskBtn.addEventListener("click", () => {
  showTaskInput("flex", "none");
  openTaskInputContainer();
});

// Add Task after Getting Details from User in Input Container
addTask.addEventListener("click", () => {
  handleTaskInput();
  saveInLocalStorage(taskList, KEYS.TASKS);
});

// Close Task Input Container
cancelTask.addEventListener("click", () => showTaskInput("none", "flex"));

// Actions on Tasks like Completed,Edit,Delete
tasksContainer.addEventListener("click", (event) => taskActions(event));

// --Tags--
// Add Tags in Tag List
addTagBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleInputField();
});

// Preventing Event Bubbling on Parent Element
tagInputContainer.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Add Tags in Tag List
sendTagBtn.addEventListener("click", () => {
  handleTagInput();
  saveInLocalStorage(tagList, KEYS.TAGS);
});

// Show Tags in Input Container When User Click on Add Tag Btn
showTagsBtn.addEventListener("click", () => {
  renderTagList(tagInputList);
  if (tagList.length > 0) {
    showTagList("none", "flex");
  }
});

// Update/Refresh Tags in Input Container if User Add New Tags in List
updateTagButton.addEventListener("click", () => {
  renderTagList(tagInputList);
  if (tagList.length === 0) {
    showTagList("block", "none");
  }
});

//To Select Tags from Tags List for Task
tagInputList.addEventListener("click", (event) => selectTag(event));

// Task Searching
// Search Task by Name
searchBtn.addEventListener("click", () => {
  searchTask();
});

// --Tasks Filteration--
// Toggle Staus Filter Dropdown
statusFilter.addEventListener("click", () => {
  statusFilterOptions.classList.toggle(CLASSES.FILTER_DROPDOWN);
});

// Filter Task By Status
statusFilterOptions.addEventListener("click", (event) => filterByStatus(event));

// Filter Task By Tags Name
tagFilterOptions.addEventListener("click", (event) => filterByTags(event));

// Show Tags for Task Filter
tagFilter.addEventListener("click", () => showTagsforFilter());

// Filter Task By Type
tasksListFilter.addEventListener("click", (e) => filterTasksByType(e));

// --Window--
// For Checking Screen Size on Screen Resize to Enable or Disable Mobile View
window.addEventListener("resize", () => checkViewPort());

// Retrieving Tasks & Tags from Local Storage
window.addEventListener("load", () => retriveData());
