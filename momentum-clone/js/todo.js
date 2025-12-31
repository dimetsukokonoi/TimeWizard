/**
 * To-Do List Module
 * Task management with persistence
 */

const Todo = {
    panel: null,
    list: null,
    input: null,
    addBtn: null,
    toggleBtn: null,
    countBadge: null,
    todos: [],

    init() {
        this.panel = document.getElementById('todoPanel');
        this.list = document.getElementById('todoList');
        this.input = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addTodoBtn');
        this.toggleBtn = document.getElementById('todoToggle');
        this.countBadge = document.getElementById('todoCount');

        this.load();
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.panel.classList.toggle('active');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        // Add todo on button click
        this.addBtn.addEventListener('click', () => this.addTodo());

        // Add todo on Enter
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    },

    load() {
        this.todos = Storage.get('todos', []);
    },

    save() {
        Storage.set('todos', this.todos);
    },

    addTodo() {
        const text = this.input.value.trim();
        if (!text) return;

        this.todos.push({
            id: Date.now(),
            text: text,
            completed: false
        });

        this.input.value = '';
        this.save();
        this.render();
    },

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    },

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.save();
        this.render();
    },

    render() {
        this.list.innerHTML = '';

        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
        <button class="delete-todo">✕</button>
      `;

            // Toggle completion
            li.querySelector('input').addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            // Delete todo
            li.querySelector('.delete-todo').addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });

            this.list.appendChild(li);
        });

        // Update count badge
        const incompleteCount = this.todos.filter(t => !t.completed).length;
        this.countBadge.textContent = incompleteCount;
        if (incompleteCount > 0) {
            this.countBadge.classList.add('active');
        } else {
            this.countBadge.classList.remove('active');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
