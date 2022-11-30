const url = 'https://graphqlzero.almansi.me/api';

const addForm = document.forms.addtask;
const searchForm = document.forms.findtask;
const todos = document.getElementById('todos');

addForm.addEventListener('submit', addTaskHendler);
searchForm.addEventListener('submit', findTodos)

//Для работы c GraphQL
const makeRequest = (query) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({query: query})
  }).then(res => res.json());
};

function printToDo({title, completed = true, id = '', user = {}}) {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `&nbsp; ${title} | ID: ${id} | by <b>${user.name}</b>`;
  li.setAttribute('data-id', id);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  if (completed) {
    checkbox.setAttribute('checked', 'true');
  }
  checkbox.addEventListener('change', handleTodoStatus)
  li.prepend(checkbox);
  const del = document.createElement('button');
  del.className = 'btn btn-link mb-1';
  del.innerHTML = '&times;';
  del.addEventListener('click', handleDeleteTodo)
  li.append(del);
  todos.prepend(li);
}

makeRequest(` query Todos{
  todos {
    data{
      id
      title
      completed
      user{
        name
        address {
          city
        }
      }
    }
  }
}`).then(({data}) => data.todos.data.forEach(todo => printToDo(todo)));

async function addTaskHendler(e) {
  e.preventDefault();
  if (addForm.taskname.value) {
    const newTaskQuery = `mutation createTodo {
  createTodo(input: {title: "${addForm.taskname.value}", completed: false}) {
    title
    completed
    id
  }
}`;
    const data = await makeRequest(newTaskQuery);
    printToDo(data.data.createTodo);
    addForm.reset();
  }
}

async function findTodos(e) {
  e.preventDefault();
  const serchText = searchForm.searchname.value;

  if (serchText) {
    const searchQuery = `query searchQuery {
  todos(options: {search: {q: "${serchText}"}, sort: {order: DESC}}){
     data{
     id
     title
     completed
     user {
          name: username
        }
     }
  }
}`;
    const {data} = await makeRequest(searchQuery)
    todos.innerHTML = ''
    data.todos.data.forEach(todo => printToDo(todo))
  }
}

async function handleTodoStatus(e){
  const todoId = this.parentElement.dataset.id
  const changeStatusQuery = `mutation changeStatus{
  updateTodo(id: "${todoId}", input: {completed: ${this.checked}}){
    completed
  }
}`

  const data = await makeRequest(changeStatusQuery)
  if(data.data.updateTodo.completed){
    this.setAttribute("checked", "true")
  } else {
    this.removeAttribute("checked")
  }
}

async function handleDeleteTodo(){
  const todoID = this.parentElement.dataset.id
  const deleteQuery = `mutation DeleteTodo {
  deleteTodo(id: "${todoID}")
}`
  const data = await makeRequest(deleteQuery)
  if(data.data.deleteTodo){
    this.parentElement.remove()
  }
}



