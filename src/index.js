import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from 'axios'


const api = axios.create({
  baseURL: 'https://statuesque-slicer.glitch.me/'

})

api.interceptors.request.use(function (config) {
  // localStorage에 token이 있으면 요청에 헤더 설정, 없으면 아무것도 하지 않음
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
 });

const templates = {
  loginForm: document.querySelector('#login-form').content,
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content

}

const rootEl = document.querySelector('.root')

function drawLoginForm(){
// 1. 템플릿 복사
const fragment = document.importNode(templates.loginForm, true)
//2. 내용채우고 리스너 등록
const loginFormEl = fragment.querySelector('.login-form')

loginFormEl.addEventListener('submit', async e => {
  e.preventDefault()
const username = e.target.elements.username.value
//e: 이벤트 객체, e.target : 이벤트를 실제로 일으킨 요소 객체(여기서는 loginformel)
//e.target.elements : 폼 내부에 들어있는 요소 객체를 편하게 가져올 수 있는 특이한 객체
//e.target.elements.username : name 어트리뷰트에 username이라고 지정되어있는 input 요소 객체
//e.target.elements.username.value: 사용자가 input 태그에 입력한 값
const password = e.target.elements.password.value

const res = await api.post('/users/login', {
  username: username,
  password: password
})
localStorage.setItem('token', res.data.token)

drawTodoList()

})

//3. 문서 내부에 삽입하기

rootEl.textContent = ''
rootEl.appendChild(fragment)
}
drawLoginForm()


async function drawTodoList (){
  const res =  await api.get('/todos')
  const list = res.data

  //1. 템플릿 복사
  const fragment = document.importNode(templates.todoList, true)
  //2. 내용채우고 이벤트 리스너 등록
  const todoListEl = fragment.querySelector('.todo-list')
  const todoFormEl = fragment.querySelector('.todo-form')
  const logoutEl = fragment.querySelector('.logout')

  logoutEl.addEventListener('click', e =>{
    //로그아웃 절차
    //1.토큰 삭제
    localStorage.removeItem('token')
    //2. 로그인 폼 보여주기
    drawLoginForm()

  })

  todoFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const body = e.target.elements.body.value;
    const res = await api.post('/todos', {
      body,
      complete: false
    })
      drawTodoList()
  })

  list.forEach(todoItem  => {
    //1. 템플릿 복사
    const fragment = document.importNode(templates.todoItem, true)
    //2. 내용채우고 이벤트 리스너 등록
    const bodyEl = fragment.querySelector('.body')


    // const todoItemEl = fragment.querySelector('.todo-item')
    bodyEl.textContent = todoItem.body

    //삭제
    const deleteEl = fragment.querySelector('.delete')
    deleteEl.addEventListener('click', async e => {
     await api.delete('/todos/' + todoItem.id)
     drawTodoList()
    })

  //3. 문서 내부에 삽입하기
  todoListEl.appendChild(fragment)

  })

  //3. 문서 내부에 삽입하기
  rootEl.textContent = '';
  rootEl.appendChild(fragment)
}

if (localStorage.getItem('token')){
  drawTodoList()
}else{
  drawLoginForm()
}


