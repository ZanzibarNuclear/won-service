// services/user.service.ts
import { CreateUser, User } from '../types'
import { UserRepository } from './user.repository'

class UserService {
  private repository: UserRepository

  constructor(repository: UserRepository) {
    this.repository = repository
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id)
    if (!user) {
      throw { code: 'NOT_FOUND', message: `User with id ${id} not found` }
    }
    return user
  }

  async create(userData: CreateUser): Promise<User> {
    // Add validation if needed
    return this.repository.create(userData)
  }

  async update(id: string, userData: CreateUser): Promise<User> {
    const exists = await this.repository.findById(id)
    if (!exists) {
      throw { code: 'NOT_FOUND', message: `User with id ${id} not found` }
    }
    return this.repository.update(id, userData)
  }

  async delete(id: string): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists) {
      throw { code: 'NOT_FOUND', message: `User with id ${id} not found` }
    }
    await this.repository.delete(id)
  }
}

export const userService = new UserService(new UserRepository())