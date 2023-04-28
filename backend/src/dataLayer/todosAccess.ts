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

    async updateTodo(todoId: string, userId: string, updatedTodo: TodoUpdate): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: "set #n = :n, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":n": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done
            },
            ExpressionAttributeNames: { '#n': 'name' },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { userId, todoId }
        }).promise()
    }

    async checkExists(todoId: String, userId: String) {
        const result = await this.docClient
            .get({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            })
            .promise()
        return !!result.Item
    }

}