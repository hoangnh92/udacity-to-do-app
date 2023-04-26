import {TodosAccess} from '../dataLayer/todosAccess'
import {AttachmentUtils} from '../helpers/attachmentUtils';
import {TodoItem} from '../models/TodoItem'
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest'
import {createLogger} from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess');
const attachmentUtils = new AttachmentUtils;
const todoAccess = new TodosAccess()

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();
    const attachmentUrl = await attachmentUtils.getAttachmentUrl(todoId);

    const todoItem: TodoItem = {
        todoId,
        userId,
        createdAt,
        done: false,
        attachmentUrl,
        ...createTodoRequest
    };

    logger.info(`Creating todo ${todoId} for user ${userId}`);

    return await todoAccess.createTodo(todoItem);
}

async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user ${userId}`);
    return todoAccess.getTodos(userId);
}

export async function updateTodo(
    userId: string,
    todoId: string,
    todoUpdate: UpdateTodoRequest
): Promise<void> {
    return await todoAccess.updateTodo(todoId, userId, todoUpdate);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info('delete todo', todoId)
    return await todoAccess.deleteTodo(userId, todoId)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos for user`);

    return await todoAccess.getAllTodos(userId);
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    logger.info('create attachment url', todoId, userId)

    return await attachmentUtils.getUploadUrl(todoId)
}
