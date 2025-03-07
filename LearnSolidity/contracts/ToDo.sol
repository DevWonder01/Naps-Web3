// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        string content;
        bool completed;
    }

    Task[] public tasks;

    function createTask(string memory _content) public {
        tasks.push(Task(_content, false));
    }

    function toggleCompleted(uint256 _index) public {
        require(_index < tasks.length, "Task index out of bounds.");
        tasks[_index].completed = !tasks[_index].completed;
    }

    function getTask(uint256 _index) public view returns (string memory content, bool completed) {
        require(_index < tasks.length, "Task index out of bounds.");
        return (tasks[_index].content, tasks[_index].completed);
    }

    function getTaskCount() public view returns (uint256) {
        return tasks.length;
    }

    function updateTask(uint256 _index, string memory _content) public {
        require(_index < tasks.length, "Task index out of bounds.");
        tasks[_index].content = _content;
    }

    function deleteTask(uint256 _index) public {
        require(_index < tasks.length, "Task index out of bounds.");
        // Shift elements to fill the gap.
        for (uint256 i = _index; i < tasks.length - 1; i++) {
            tasks[i] = tasks[i + 1];
        }
        // Remove the last element (which is now a duplicate).
        tasks.pop();
    }
}