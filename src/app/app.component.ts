import {Component, OnInit} from '@angular/core';
import {TodoObj} from './todoObj';
import {formatDate} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  todoListObj: TodoObj;
  todoList: TodoObj [];
  tempTodoList: TodoObj [];
  dataPriority = [];
  today = new Date();
  form: FormGroup;
  submitted: boolean = false;
  check: boolean = false;
  isChange: boolean = false;
  input: string;
  titleEdit: string;
  descriptionEdit: string;
  dueDateEdit: string;
  priorityEdit: any;
  todoIdEdit: number;
  keysToRemove = [];
  checkBulk:boolean = false;
  isSmaller: boolean = false;
  isSmallerEdit: boolean = false;
  isRequired: boolean = false;

  constructor(private fb: FormBuilder, ) {
    this.todoListObj = new TodoObj();
    this.todoList = [];
    this.dataPriority = [
      {name: 'normal', value: 1},
      {name: 'low', value: 2},
      {name: 'high', value: 3},
    ];
  }

  ngOnInit(): void {
    this.getTodoList();
    this.sortData();
    this.form = this.fb.group({
      chooseTitle: new FormControl(null, [Validators.required]),
      chooseDescription: new FormControl(null),
      chooseDueDate: new FormControl(formatDate(this.today, 'yyyy-MM-dd', 'en')),
      choosePriority: new FormControl(this.dataPriority[0].value)
    });
  }

  sortData() {
    return this.tempTodoList.sort((a, b) => {
      return <any>new Date(a.dueDate) - <any>new Date(b.dueDate);
    });
  }

  get f() {
    return this.form.controls;
  }

  getNewTodoList() {
    const oldRecords = localStorage.getItem('todoList');
    if (oldRecords !== null) {
      const todoList = JSON.parse(oldRecords);
      return Math.random();
    } else {
      return Math.random();
    }
  }

  getTodoList() {
    const records = localStorage.getItem('todoList');
    if (records !== null) {
      this.todoList = JSON.parse(records);
    }
    this.todoList = this.todoList.map(x => {
      return {
        ...x,
        isChange: this.isChange,
        checked: false
      };
    });
    this.tempTodoList = this.todoList;
    this.sortData();
    localStorage.setItem('todoList', JSON.stringify(this.tempTodoList));
  }

  addTodoList() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    const latestId = this.getNewTodoList();
    this.todoListObj.todoId = latestId;
    this.todoListObj.title = this.form.value.chooseTitle;
    this.todoListObj.description = this.form.value.chooseDescription;
    this.todoListObj.dueDate = this.form.value.chooseDueDate;
    this.todoListObj.priority = this.form.value.choosePriority;
    if (formatDate(this.form.controls.chooseDueDate.value, 'yyyy-MM-dd', 'en') >=
        formatDate(this.today, 'yyyy-MM-dd', 'en')) {
      this.isSmaller = false;
    } else {
      this.isSmaller = true;
      return;
    }
    const oldRecords = localStorage.getItem('todoList');
    if (oldRecords !== null) {
      const todoList = JSON.parse(oldRecords);
      todoList.push(this.todoListObj);
      localStorage.setItem('todoList', JSON.stringify(todoList));
    } else {
      const todoArr = [];
      todoArr.push(this.todoListObj);
      localStorage.setItem('todoList', JSON.stringify(todoArr));
    }
    this.getTodoList();
    // this.form.get('chooseTitle').setValue(null);
    // this.form.get('chooseDescription').setValue(null);
  }

  detail(dataItem: any) {
    dataItem.isChange = !dataItem.isChange;
    this.tempTodoList.filter(x => x.todoId !== dataItem.todoId).map(x => x.isChange = false);
    if (dataItem) {
      this.todoIdEdit = dataItem.todoId;
      this.titleEdit = dataItem.title;
      this.descriptionEdit = dataItem.description;
      this.dueDateEdit = dataItem.dueDate;
      this.priorityEdit = dataItem.priority;
    }
  }

  onFilter() {
    if (!this.input) {
      this.tempTodoList = this.todoList;
    } else {
      if (this.input) {
        this.tempTodoList = this.todoList.filter( keyword => {
          return keyword.title.toLocaleLowerCase().match(this.input.toLocaleLowerCase());
        });
      }
    }
  }

  delete(item: any) {
    // cách 1
    // const oldRecords =  localStorage.getItem('todoList');
    // if (oldRecords !== null) {
    //   const newData = [];
    //   const todoList = JSON.parse(oldRecords);
    //   for(let i = 0; i < todoList.length; i++)
    //   {
    //     if ( todoList[i].todoId !== item.todoId)
    //     {
    //       newData.push(todoList[i]);
    //     }
    //   }
    //   localStorage.setItem('todoList', JSON.stringify(newData));
    //
    // }
    // cách 2
    const oldRecords =  localStorage.getItem('todoList');
    if (oldRecords !== null) {
      const todoList = JSON.parse(oldRecords);
      todoList.splice(todoList.findIndex((a: any) => a.todoId === item.todoId), 1);
      localStorage.setItem('todoList', JSON.stringify(todoList));
    }
    this.getTodoList();
  }

  deleteMany() {
    const results = this.tempTodoList.filter(({ todoId: id1 }) => !this.keysToRemove.some(({ todoId: id2 }) => id2 === id1));
    localStorage.setItem('todoList', JSON.stringify(results));
    this.keysToRemove = [];
    this.getTodoList();
    this.checkBulk = false;
  }

  changeCheckbox() {
    this.keysToRemove = this.tempTodoList.filter(item => item.checked);
    if (this.keysToRemove.length > 0) {
      this.checkBulk = true;
    } else {
      this.checkBulk = false;
    }
  }

  update() {
    if (this.titleEdit) {
      this.isRequired = false;
    } else {
      this.isRequired = true;
      return;
    }
    if (formatDate(this.dueDateEdit, 'yyyy-MM-dd', 'en') >=
      formatDate(this.today, 'yyyy-MM-dd', 'en')) {
      this.isSmallerEdit = false;
    } else {
      this.isSmallerEdit = true;
      return;
    }
    const oldRecords =  localStorage.getItem('todoList');
    if (oldRecords !== null) {
      const todoList = JSON.parse(oldRecords);
      todoList.splice(todoList.findIndex((a: any) => a.todoId === this.todoIdEdit), 1);
      const body = {
        description: this.descriptionEdit,
        dueDate: this.dueDateEdit,
        priority: this.priorityEdit,
        title: this.titleEdit,
        todoId: this.todoIdEdit
      };
      todoList.push(body);
      localStorage.setItem('todoList', JSON.stringify(todoList));
    }
    this.getTodoList();
  }

  changeDueDate() {
    if (formatDate(this.form.controls.chooseDueDate.value, 'yyyy-MM-dd', 'en') >=
      formatDate(this.today, 'yyyy-MM-dd', 'en')) {
      this.isSmaller = false;
    } else {
      this.isSmaller = true;
      return;
    }
  }

  changeTitleEdit() {
    if (this.titleEdit) {
      this.isRequired = false;
    } else {
      this.isRequired = true;
      return;
    }
  }

  changeDueDateEdit() {
    if (formatDate(this.dueDateEdit, 'yyyy-MM-dd', 'en') >=
      formatDate(this.today, 'yyyy-MM-dd', 'en')) {
      this.isSmallerEdit = false;
    } else {
      this.isSmallerEdit = true;
      return;
    }
  }
}
