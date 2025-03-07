// test/TodoList.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TodoList", function () {
  let TodoList;
  let todoList;

  beforeEach(async function () {
    TodoList = await ethers.getContractFactory("TodoList");
    todoList = await TodoList.deploy();
    await todoList.deployed();
  });

  it("Should create a new task", async function () {
    await todoList.createTask("Buy groceries");
    const task = await todoList.getTask(0);
    expect(task.content).to.equal("Buy groceries");
    expect(task.completed).to.equal(false);
  });

  it("Should toggle the completed status of a task", async function () {
    await todoList.createTask("Walk the dog");
    await todoList.toggleCompleted(0);
    const task = await todoList.getTask(0);
    expect(task.completed).to.equal(true);
    await todoList.toggleCompleted(0);
    const task2 = await todoList.getTask(0);
    expect(task2.completed).to.equal(false);
  });

  it("Should return the correct task count", async function () {
    expect(await todoList.getTaskCount()).to.equal(0);
    await todoList.createTask("Task 1");
    expect(await todoList.getTaskCount()).to.equal(1);
    await todoList.createTask("Task 2");
    expect(await todoList.getTaskCount()).to.equal(2);
  });

  it("Should update an existing task", async function () {
    await todoList.createTask("Original Task");
    await todoList.updateTask(0, "Updated Task");
    const task = await todoList.getTask(0);
    expect(task.content).to.equal("Updated Task");
  });

  it("Should delete an existing task", async function () {
    await todoList.createTask("Task 1");
    await todoList.createTask("Task 2");
    await todoList.deleteTask(0);
    expect(await todoList.getTaskCount()).to.equal(1);
    const task = await todoList.getTask(0);
    expect(task.content).to.equal("Task 2");
  });

  it("Should revert when accessing an out-of-bounds task", async function () {
    await expect(todoList.getTask(0)).to.be.revertedWith("Task index out of bounds.");
    await expect(todoList.toggleCompleted(0)).to.be.revertedWith("Task index out of bounds.");
    await expect(todoList.updateTask(0, "test")).to.be.revertedWith("Task index out of bounds.");
    await expect(todoList.deleteTask(0)).to.be.revertedWith("Task index out of bounds.");
  });
});