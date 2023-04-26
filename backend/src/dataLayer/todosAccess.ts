import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating todo`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo as TodoItem;
    }

    async updateTodo(
        userId: string,
        todoId: string,
        todoUpdate: TodoUpdate
    ): Promise<void> {
        logger.info(`Updating todo ${todoId} for user ${userId}`)

        const key = {
            userId: userId,
            todoId: todoId
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: key,
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': todoUpdate.name,
                ':due': todoUpdate.dueDate,
                ':d': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()
    }

    async updateTodoAttachmentUrl(
        userId: string,
        todoId: string,
        attachmentUrl: string
    ): Promise<void> {
        logger.info(`Updating todo ${todoId} for user ${userId}`)

        const key = {
            userId: userId,
            todoId: todoId
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: key,
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            }
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { userId, todoId }
        }).promise()
    }

}